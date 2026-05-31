import type { FieldType, Operator } from '@/types/query';
import type { UserRecord } from '@/lib/mock/dataset';


// Operator map — which operators are valid per field type
export const OPERATOR_MAP: Record<FieldType, Operator[]> = {
  string:  ['equals', 'notEquals', 'contains', 'startsWith', 'inArray', 'regex', 'isNull', 'isNotNull'],
  number:  ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'isNull', 'isNotNull'],
  enum:    ['equals', 'notEquals', 'inArray', 'isNull', 'isNotNull'],
  date:    ['equals', 'notEquals', 'before', 'after', 'between', 'isNull', 'isNotNull'],
  boolean: ['equals', 'notEquals', 'isNull', 'isNotNull'],
  array:   ['contains', 'isNull', 'isNotNull'],
};

// Operator display labels — human-readable names for each operator
export const OPERATOR_LABELS: Record<Operator, string> = {
  equals:      'equals',
  notEquals:   'not equals',
  contains:    'contains',
  startsWith:  'starts with',
  greaterThan: 'greater than',
  lessThan:    'less than',
  inArray:     'in list',
  between:     'between',
  regex:       'matches regex',
  isNull:      'is null',
  isNotNull:   'is not null',
  before:      'before',
  after:       'after',
};

// Operators that require no value input
export const NO_VALUE_OPERATORS = new Set<Operator>(['isNull', 'isNotNull']);

// Results panel — pagination and visible columns
export const RESULTS_PAGE_SIZE = 10;

export const RESULTS_COLUMNS: { key: keyof UserRecord; label: string }[] = [
  { key: 'id',         label: 'ID' },
  { key: 'name',       label: 'Name' },
  { key: 'age',        label: 'Age' },
  { key: 'status',     label: 'Status' },
  { key: 'isVerified', label: 'Verified' },
  { key: 'createdAt',  label: 'Created' },
];

// Live preview — syntax highlighting regex patterns
export const SQL_KEYWORDS_REGEX = /\b(SELECT|FROM|WHERE|AND|OR|LIKE|IN|BETWEEN|IS|NULL|NOT|REGEXP)\b/g;
export const SQL_STRINGS_REGEX  = /'[^']*'/g;
export const SQL_NUMBERS_REGEX  = /\b\d+(\.\d+)?\b/g;
export const JSON_TOKEN_REGEX   = /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|(\$\w+)/g;

// Live preview — available query format tabs
export const PREVIEW_TABS = ['SQL', 'MongoDB', 'GraphQL'] as const;
export type PreviewTab = typeof PREVIEW_TABS[number];
