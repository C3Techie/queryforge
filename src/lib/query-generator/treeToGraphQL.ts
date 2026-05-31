import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';


function coerceValue(value: unknown, fieldType: string): unknown {
  if (fieldType === 'number') return Number(value);
  if (fieldType === 'boolean') return String(value) === 'true';
  return value;
}

function ruleToGQL(rule: Rule, schema: Schema): Record<string, unknown> {
  const schemaField = schema.fields.find((f) => f.name === rule.field);
  const fieldType = schemaField?.type ?? 'string';
  const val = coerceValue(rule.value, fieldType);

  switch (rule.operator) {
    case 'equals':
      return { [rule.field]: { eq: val } };

    case 'notEquals':
      return { [rule.field]: { neq: val } };

    case 'contains':
      return { [rule.field]: { contains: String(rule.value) } };

    case 'startsWith':
      return { [rule.field]: { startsWith: String(rule.value) } };

    case 'greaterThan':
      return { [rule.field]: { gt: val } };

    case 'lessThan':
      return { [rule.field]: { lt: val } };

    case 'inArray': {
      const items = Array.isArray(rule.value)
        ? rule.value
        : String(rule.value).split(',').map((s) => s.trim());
      return { [rule.field]: { in: items.map((v) => coerceValue(v, fieldType)) } };
    }

    case 'between': {
      const parts = Array.isArray(rule.value) ? rule.value : [rule.value, rule.value];
      return { [rule.field]: { gte: coerceValue(parts[0], fieldType), lte: coerceValue(parts[1], fieldType) } };
    }

    case 'isNull':
      return { [rule.field]: { isNull: true } };

    case 'isNotNull':
      return { [rule.field]: { isNull: false } };

    case 'before':
      return { [rule.field]: { lt: String(rule.value) } };

    case 'after':
      return { [rule.field]: { gt: String(rule.value) } };

    case 'regex':
      return { [rule.field]: { regex: String(rule.value) } };

    default:
      return {};
  }
}


function groupToGQL(group: RuleGroup, schema: Schema): Record<string, unknown> {
  if (group.children.length === 0) return {};

  const parts = group.children.map((child) => nodeToGQL(child, schema));
  const op = group.logicalOperator === 'AND' ? 'AND' : 'OR';
  return { [op]: parts };
}

function nodeToGQL(node: QueryNode, schema: Schema): Record<string, unknown> {
  if (node.type === 'rule') return ruleToGQL(node, schema);
  return groupToGQL(node, schema);
}


export function treeToGraphQL(root: RuleGroup, schema: Schema): Record<string, unknown> {
  if (root.children.length === 0) return {};
  return groupToGQL(root, schema);
}

export function treeToGraphQLString(root: RuleGroup, schema: Schema): string {
  const filter = treeToGraphQL(root, schema);
  const filterStr = JSON.stringify(filter, null, 2);
  return `query {\n  ${schema.name.toLowerCase()}(where: ${filterStr}) {\n    id\n    name\n    email\n    age\n    status\n    createdAt\n    tags\n    isVerified\n  }\n}`;
}
