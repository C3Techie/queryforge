import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';
import { getFieldMetadata } from '@/lib/schemaUtils';
import { schemas as defaultSchemas } from '@/lib/mock/schema';
import { escapeRegexLiteral, isAllowedOperatorForField, sanitizeFieldPath } from '@/lib/querySafety';

const ALWAYS_FALSE_MONGO = { $expr: { $eq: [1, 0] } } as const;

function coerceValue(value: unknown, fieldType: string): unknown {
  if (fieldType === 'number') return Number(value);
  if (fieldType === 'boolean') return String(value) === 'true';
  return value;
}

function ruleToMongo(rule: Rule, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  const safeFieldPath = sanitizeFieldPath(rule.field);
  if (!safeFieldPath) return ALWAYS_FALSE_MONGO;

  const schemaField = getFieldMetadata(safeFieldPath, schema, schemas);
  const fieldType = schemaField?.type ?? 'string';
  if (!schemaField || !isAllowedOperatorForField(safeFieldPath, rule.operator, schema, schemas)) {
    return ALWAYS_FALSE_MONGO;
  }

  const val = coerceValue(rule.value, fieldType);

  switch (rule.operator) {
    case 'equals':
      return { [safeFieldPath]: val };

    case 'notEquals':
      return { [safeFieldPath]: { $ne: val } };

    case 'contains':
      return { [safeFieldPath]: { $regex: escapeRegexLiteral(String(rule.value)), $options: 'i' } };

    case 'startsWith':
      return { [safeFieldPath]: { $regex: `^${escapeRegexLiteral(String(rule.value))}`, $options: 'i' } };

    case 'greaterThan':
      return { [safeFieldPath]: { $gt: val } };

    case 'lessThan':
      return { [safeFieldPath]: { $lt: val } };

    case 'inArray': {
      const items = Array.isArray(rule.value)
        ? rule.value
        : String(rule.value).split(',').map((s) => s.trim());
      return { [safeFieldPath]: { $in: items.map((v) => coerceValue(v, fieldType)) } };
    }

    case 'between': {
      const parts = Array.isArray(rule.value) ? rule.value : [rule.value, rule.value];
      return { [safeFieldPath]: { $gte: coerceValue(parts[0], fieldType), $lte: coerceValue(parts[1], fieldType) } };
    }

    case 'isNull':
      return { [safeFieldPath]: null };

    case 'isNotNull':
      return { [safeFieldPath]: { $ne: null } };

    case 'before':
      return { [safeFieldPath]: { $lt: String(rule.value) } };

    case 'after':
      return { [safeFieldPath]: { $gt: String(rule.value) } };

    case 'regex':
      return { [safeFieldPath]: { $regex: String(rule.value) } };

    default:
      return ALWAYS_FALSE_MONGO;
  }
}

function groupToMongo(group: RuleGroup, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  if (group.children.length === 0) return {};

  const parts = group.children.map((child) => nodeToMongo(child, schema, schemas));
  const op = group.logicalOperator === 'AND' ? '$and' : '$or';
  return { [op]: parts };
}

function nodeToMongo(node: QueryNode, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  if (node.type === 'rule') return ruleToMongo(node, schema, schemas);
  return groupToMongo(node, schema, schemas);
}

export function treeToMongo(
  root: RuleGroup,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): Record<string, unknown> {
  if (root.children.length === 0) return {};
  return groupToMongo(root, schema, schemas);
}

export function treeToMongoString(
  root: RuleGroup,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): string {
  const filter = treeToMongo(root, schema, schemas);
  return `db.${schema.name.toLowerCase()}.find(\n${JSON.stringify(filter, null, 2)}\n)`;
}
