import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';
import { OPERATOR_MAP } from './operatorMap';

const NO_VALUE_OPERATORS = new Set(['isNull', 'isNotNull'] as const);

function validateRule(rule: Rule, schema: Schema): string[] {
  const errors: string[] = [];

  const schemaField = schema.fields.find((f) => f.name === rule.field);

  if (!schemaField) {
    errors.push(`Field "${rule.field}" does not exist in schema "${schema.name}".`);
    return errors;
  }

  const allowedOperators = OPERATOR_MAP[schemaField.type];
  if (!allowedOperators.includes(rule.operator)) {
    errors.push(
      `Operator "${rule.operator}" is not allowed for field "${rule.field}" of type "${schemaField.type}". ` +
        `Allowed operators: ${allowedOperators.join(', ')}.`
    );
  }

  if (!NO_VALUE_OPERATORS.has(rule.operator as 'isNull' | 'isNotNull')) {
    const isEmpty =
      rule.value === null ||
      rule.value === undefined ||
      (typeof rule.value === 'string' && rule.value.trim() === '') ||
      (Array.isArray(rule.value) && rule.value.length === 0);

    if (isEmpty) {
      errors.push(`A value is required for field "${rule.field}" with operator "${rule.operator}".`);
    }
  }

  return errors;
}

function validateGroup(group: RuleGroup, schema: Schema): string[] {
  const errors: string[] = [];

  if (group.children.length === 0) {
    errors.push(`Group "${group.id}" must have at least one condition.`);
    return errors;
  }

  for (const child of group.children) {
    errors.push(...validateNode(child, schema));
  }

  return errors;
}

export function validateNode(node: QueryNode, schema: Schema): string[] {
  if (node.type === 'rule') {
    return validateRule(node, schema);
  }
  return validateGroup(node, schema);
}
