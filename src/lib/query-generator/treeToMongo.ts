import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';


function coerceValue(value: unknown, fieldType: string): unknown {
  if (fieldType === 'number') return Number(value);
  if (fieldType === 'boolean') return String(value) === 'true';
  return value;
}

function ruleToMongo(rule: Rule, schema: Schema): Record<string, unknown> {
  const schemaField = schema.fields.find((f) => f.name === rule.field);
  const fieldType = schemaField?.type ?? 'string';
  const val = coerceValue(rule.value, fieldType);

  switch (rule.operator) {
    case 'equals':
      return { [rule.field]: val };

    case 'notEquals':
      return { [rule.field]: { $ne: val } };

    case 'contains':
      return { [rule.field]: { $regex: String(rule.value), $options: 'i' } };

    case 'startsWith':
      return { [rule.field]: { $regex: `^${String(rule.value)}`, $options: 'i' } };

    case 'greaterThan':
      return { [rule.field]: { $gt: val } };

    case 'lessThan':
      return { [rule.field]: { $lt: val } };

    case 'inArray': {
      const items = Array.isArray(rule.value)
        ? rule.value
        : String(rule.value).split(',').map((s) => s.trim());
      return { [rule.field]: { $in: items.map((v) => coerceValue(v, fieldType)) } };
    }

    case 'between': {
      const parts = Array.isArray(rule.value) ? rule.value : [rule.value, rule.value];
      return { [rule.field]: { $gte: coerceValue(parts[0], fieldType), $lte: coerceValue(parts[1], fieldType) } };
    }

    case 'isNull':
      return { [rule.field]: null };

    case 'isNotNull':
      return { [rule.field]: { $ne: null } };

    case 'before':
      return { [rule.field]: { $lt: String(rule.value) } };

    case 'after':
      return { [rule.field]: { $gt: String(rule.value) } };

    case 'regex':
      return { [rule.field]: { $regex: String(rule.value) } };

    default:
      return {};
  }
}


function groupToMongo(group: RuleGroup, schema: Schema): Record<string, unknown> {
  if (group.children.length === 0) return {};

  const parts = group.children.map((child) => nodeToMongo(child, schema));
  const op = group.logicalOperator === 'AND' ? '$and' : '$or';
  return { [op]: parts };
}

function nodeToMongo(node: QueryNode, schema: Schema): Record<string, unknown> {
  if (node.type === 'rule') return ruleToMongo(node, schema);
  return groupToMongo(node, schema);
}


export function treeToMongo(root: RuleGroup, schema: Schema): Record<string, unknown> {
  if (root.children.length === 0) return {};
  return groupToMongo(root, schema);
}

export function treeToMongoString(root: RuleGroup, schema: Schema): string {
  const filter = treeToMongo(root, schema);
  return `db.${schema.name.toLowerCase()}.find(\n${JSON.stringify(filter, null, 2)}\n)`;
}
