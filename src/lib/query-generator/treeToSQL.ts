import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';
import { getFieldMetadata, getReferencedFields } from '@/lib/schemaUtils';
import { schemas as defaultSchemas } from '@/lib/mock/schema';
import {
  escapeSqlString,
  isAllowedOperatorForField,
  sanitizeFieldPath,
  toSafeSqlIdentifier,
} from '@/lib/querySafety';

function formatValue(value: unknown, fieldType: string): string {
  if (value === null || value === undefined) return 'NULL';
  if (fieldType === 'number') return String(Number(value));
  if (fieldType === 'boolean') return String(value) === 'true' ? '1' : '0';
  return `'${escapeSqlString(String(value))}'`;
}

function ruleToSQL(rule: Rule, schema: Schema, schemas: Schema[]): string {
  const safeFieldPath = sanitizeFieldPath(rule.field);
  if (!safeFieldPath) return '1=0';

  const field = toSafeSqlIdentifier(safeFieldPath);
  const schemaField = getFieldMetadata(safeFieldPath, schema, schemas);
  const fieldType = schemaField?.type ?? 'string';
  if (!schemaField || !isAllowedOperatorForField(safeFieldPath, rule.operator, schema, schemas)) {
    return '1=0';
  }
  const rawValue = rule.value;

  switch (rule.operator) {
    case 'equals':
      return `${field} = ${formatValue(rawValue, fieldType)}`;

    case 'notEquals':
      return `${field} != ${formatValue(rawValue, fieldType)}`;

    case 'contains':
      return `${field} LIKE '%${escapeSqlString(String(rawValue))}%'`;

    case 'startsWith':
      return `${field} LIKE '${escapeSqlString(String(rawValue))}%'`;

    case 'greaterThan':
      return `${field} > ${formatValue(rawValue, fieldType)}`;

    case 'lessThan':
      return `${field} < ${formatValue(rawValue, fieldType)}`;

    case 'inArray': {
      const items = Array.isArray(rawValue)
        ? rawValue
        : String(rawValue).split(',').map((s) => s.trim());
      const formatted = items.map((v) => formatValue(v, fieldType)).join(', ');
      return `${field} IN (${formatted})`;
    }

    case 'between': {
      const parts = Array.isArray(rawValue)
        ? rawValue
        : [rawValue, rawValue];
      return `${field} BETWEEN ${formatValue(parts[0], fieldType)} AND ${formatValue(parts[1], fieldType)}`;
    }

    case 'isNull':
      return `${field} IS NULL`;

    case 'isNotNull':
      return `${field} IS NOT NULL`;

    case 'before':
      return `${field} < ${formatValue(rawValue, 'date')}`;

    case 'after':
      return `${field} > ${formatValue(rawValue, 'date')}`;

    case 'regex':
      return `${field} REGEXP '${escapeSqlString(String(rawValue))}'`;

    default:
      return '1=1';
  }
}

function groupToSQL(group: RuleGroup, schema: Schema, schemas: Schema[], isRoot: boolean): string {
  if (group.children.length === 0) return '1=1';

  const parts = group.children.map((child) => nodeToSQL(child, schema, schemas, false));
  const joined = parts.join(` ${group.logicalOperator} `);
  return isRoot ? joined : `(${joined})`;
}

function nodeToSQL(node: QueryNode, schema: Schema, schemas: Schema[], isRoot: boolean): string {
  if (node.type === 'rule') return ruleToSQL(node, schema, schemas);
  return groupToSQL(node, schema, schemas, isRoot);
}

export function treeToSQL(
  root: RuleGroup,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): string {
  if (root.children.length === 0) {
    return `SELECT * FROM \`${schema.name}\`;`;
  }
  
  const where = groupToSQL(root, schema, schemas, true);
  
  // Find referenced relation fields and generate JOINs
  const refFields = getReferencedFields(root);
  const joins: string[] = [];
  const relationsSeen = new Set<string>();

  for (const fieldPath of refFields) {
    if (fieldPath.includes('.')) {
      const relationName = fieldPath.split('.')[0];
      if (!relationsSeen.has(relationName)) {
        relationsSeen.add(relationName);
        const relation = schema.relations?.find(r => r.name === relationName);
        if (relation) {
          joins.push(`JOIN \`${relation.targetSchema}\` AS \`${relationName}\` ON \`${schema.name}\`.\`${relation.localField}\` = \`${relationName}\`.\`${relation.foreignField}\``);
        }
      }
    }
  }

  const joinClause = joins.length > 0 ? `\n${joins.join('\n')}` : '';
  const selectPrefix = joins.length > 0 ? `\`${schema.name}\`.*` : '*';

  return `SELECT ${selectPrefix}\nFROM \`${schema.name}\`${joinClause}\nWHERE ${where};`;
}
