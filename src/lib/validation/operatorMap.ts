import type { FieldType, Operator } from '@/types/query';

export const OPERATOR_MAP: Record<FieldType, Operator[]> = {
  string:  ['equals', 'notEquals', 'contains', 'startsWith', 'inArray', 'regex', 'isNull', 'isNotNull'],
  number:  ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'isNull', 'isNotNull'],
  enum:    ['equals', 'notEquals', 'inArray', 'isNull', 'isNotNull'],
  date:    ['equals', 'notEquals', 'before', 'after', 'between', 'isNull', 'isNotNull'],
  boolean: ['equals', 'notEquals', 'isNull', 'isNotNull'],
  array:   ['contains', 'isNull', 'isNotNull'],
};
