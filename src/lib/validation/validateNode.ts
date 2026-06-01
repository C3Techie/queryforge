import type { QueryNode, Rule, RuleGroup, Schema } from '@/types/query';
import { OPERATOR_MAP, NO_VALUE_OPERATORS } from '@/lib/constants';
import { getFieldMetadata } from '@/lib/schemaUtils';
import { schemas as defaultSchemas } from '@/lib/mock/schema';

function validateRule(rule: Rule, schema: Schema, schemas: Schema[]): string[] {
  const errors: string[] = [];

  const schemaField = getFieldMetadata(rule.field, schema, schemas);

  if (!schemaField) {
    errors.push(`Field "${rule.field}" does not exist in schema "${schema.name}" or its relations.`);
    return errors;
  }

  const allowedOperators = OPERATOR_MAP[schemaField.type];
  if (!allowedOperators.includes(rule.operator)) {
    errors.push(
      `Operator "${rule.operator}" is not allowed for field "${rule.field}" of type "${schemaField.type}". ` +
        `Allowed operators: ${allowedOperators.join(', ')}.`
    );
  }

  if (!NO_VALUE_OPERATORS.has(rule.operator)) {
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

function validateGroup(group: RuleGroup, schema: Schema, schemas: Schema[]): string[] {
  const errors: string[] = [];

  if (group.children.length === 0) {
    errors.push(`Group "${group.id}" must have at least one condition.`);
    return errors;
  }

  for (const child of group.children) {
    errors.push(...validateNode(child, schema, schemas));
  }

  return errors;
}

export function validateNode(
  node: QueryNode,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): string[] {
  if (node.type === 'rule') {
    return validateRule(node, schema, schemas);
  }
  return validateGroup(node, schema, schemas);
}
