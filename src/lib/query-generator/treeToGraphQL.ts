import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';
import { getFieldMetadata } from '@/lib/schemaUtils';
import { schemas as defaultSchemas } from '@/lib/mock/schema';
import { isAllowedOperatorForField, sanitizeFieldPath } from '@/lib/querySafety';

function coerceValue(value: unknown, fieldType: string): unknown {
  if (fieldType === 'number') return Number(value);
  if (fieldType === 'boolean') return String(value) === 'true';
  return value;
}

function buildNestedFilter(fieldPath: string, filterVal: unknown): Record<string, unknown> {
  const parts = fieldPath.split('.');
  const result: Record<string, unknown> = {};
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    current[key] = {};
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = filterVal;
  return result;
}

function ruleToGQL(rule: Rule, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  const safeFieldPath = sanitizeFieldPath(rule.field);
  if (!safeFieldPath) return { _invalid: true };

  const schemaField = getFieldMetadata(safeFieldPath, schema, schemas);
  const fieldType = schemaField?.type ?? 'string';
  if (!schemaField || !isAllowedOperatorForField(safeFieldPath, rule.operator, schema, schemas)) {
    return { _invalid: true };
  }
  const val = coerceValue(rule.value, fieldType);
  let filterVal: unknown;

  switch (rule.operator) {
    case 'equals':
      filterVal = { eq: val };
      break;

    case 'notEquals':
      filterVal = { neq: val };
      break;

    case 'contains':
      filterVal = { contains: String(rule.value) };
      break;

    case 'startsWith':
      filterVal = { startsWith: String(rule.value) };
      break;

    case 'greaterThan':
      filterVal = { gt: val };
      break;

    case 'lessThan':
      filterVal = { lt: val };
      break;

    case 'inArray': {
      const items = Array.isArray(rule.value)
        ? rule.value
        : String(rule.value).split(',').map((s) => s.trim());
      filterVal = { in: items.map((v) => coerceValue(v, fieldType)) };
      break;
    }

    case 'between': {
      const parts = Array.isArray(rule.value) ? rule.value : [rule.value, rule.value];
      filterVal = { gte: coerceValue(parts[0], fieldType), lte: coerceValue(parts[1], fieldType) };
      break;
    }

    case 'isNull':
      filterVal = { isNull: true };
      break;

    case 'isNotNull':
      filterVal = { isNull: false };
      break;

    case 'before':
      filterVal = { lt: String(rule.value) };
      break;

    case 'after':
      filterVal = { gt: String(rule.value) };
      break;

    case 'regex':
      filterVal = { regex: String(rule.value) };
      break;

    default:
      filterVal = {};
  }

  return buildNestedFilter(safeFieldPath, filterVal);
}

function groupToGQL(group: RuleGroup, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  if (group.children.length === 0) return {};

  const parts = group.children.map((child) => nodeToGQL(child, schema, schemas));
  const op = group.logicalOperator === 'AND' ? 'AND' : 'OR';
  return { [op]: parts };
}

function nodeToGQL(node: QueryNode, schema: Schema, schemas: Schema[]): Record<string, unknown> {
  if (node.type === 'rule') return ruleToGQL(node, schema, schemas);
  return groupToGQL(node, schema, schemas);
}

export function treeToGraphQL(
  root: RuleGroup,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): Record<string, unknown> {
  if (root.children.length === 0) return {};
  return groupToGQL(root, schema, schemas);
}

export function treeToGraphQLString(
  root: RuleGroup,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): string {
  const filter = treeToGraphQL(root, schema, schemas);
  const filterStr = JSON.stringify(filter, null, 2);
  return `query {\n  ${schema.name.toLowerCase()}(where: ${filterStr}) {\n    id\n    name\n    email\n    age\n    status\n    createdAt\n    tags\n    isVerified\n  }\n}`;
}
