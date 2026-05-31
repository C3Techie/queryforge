import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';


function escapeString(value: string): string {
  return value.replace(/'/g, "''");
}

function formatValue(value: unknown, fieldType: string): string {
  if (value === null || value === undefined) return 'NULL';
  if (fieldType === 'number') return String(Number(value));
  if (fieldType === 'boolean') return String(value) === 'true' ? '1' : '0';
  return `'${escapeString(String(value))}'`;
}


function ruleToSQL(rule: Rule, schema: Schema): string {
  const field = `\`${rule.field}\``;
  const schemaField = schema.fields.find((f) => f.name === rule.field);
  const fieldType = schemaField?.type ?? 'string';
  const rawValue = rule.value;

  switch (rule.operator) {
    case 'equals':
      return `${field} = ${formatValue(rawValue, fieldType)}`;

    case 'notEquals':
      return `${field} != ${formatValue(rawValue, fieldType)}`;

    case 'contains':
      return `${field} LIKE '%${escapeString(String(rawValue))}%'`;

    case 'startsWith':
      return `${field} LIKE '${escapeString(String(rawValue))}%'`;

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
      return `${field} REGEXP '${escapeString(String(rawValue))}'`;

    default:
      return '1=1';
  }
}


function groupToSQL(group: RuleGroup, schema: Schema, isRoot: boolean): string {
  if (group.children.length === 0) return '1=1';

  const parts = group.children.map((child) => nodeToSQL(child, schema, false));
  const joined = parts.join(` ${group.logicalOperator} `);
  return isRoot ? joined : `(${joined})`;
}

function nodeToSQL(node: QueryNode, schema: Schema, isRoot: boolean): string {
  if (node.type === 'rule') return ruleToSQL(node, schema);
  return groupToSQL(node, schema, isRoot);
}


export function treeToSQL(root: RuleGroup, schema: Schema): string {
  if (root.children.length === 0) {
    return `SELECT * FROM \`${schema.name}\`;`;
  }
  const where = groupToSQL(root, schema, true);
  return `SELECT *\nFROM \`${schema.name}\`\nWHERE ${where};`;
}
