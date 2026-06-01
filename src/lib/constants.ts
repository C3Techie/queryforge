import type { FieldType, Operator } from '@/types/query';
import type { UserRecord } from '@/lib/mock/dataset';


export const OPERATOR_MAP: Record<FieldType, Operator[]> = {
  string:  ['equals', 'notEquals', 'contains', 'startsWith', 'inArray', 'regex', 'isNull', 'isNotNull'],
  number:  ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'isNull', 'isNotNull'],
  enum:    ['equals', 'notEquals', 'inArray', 'isNull', 'isNotNull'],
  date:    ['equals', 'notEquals', 'before', 'after', 'between', 'isNull', 'isNotNull'],
  boolean: ['equals', 'notEquals', 'isNull', 'isNotNull'],
  array:   ['contains', 'isNull', 'isNotNull'],
};

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

export const NO_VALUE_OPERATORS = new Set<Operator>(['isNull', 'isNotNull']);

export const RESULTS_PAGE_SIZE = 10;

export const RESULTS_COLUMNS: { key: keyof UserRecord; label: string }[] = [
  { key: 'id',         label: 'ID' },
  { key: 'name',       label: 'Name' },
  { key: 'age',        label: 'Age' },
  { key: 'status',     label: 'Status' },
  { key: 'isVerified', label: 'Verified' },
  { key: 'createdAt',  label: 'Created' },
];

export const SQL_KEYWORDS_REGEX = /\b(SELECT|FROM|WHERE|AND|OR|LIKE|IN|BETWEEN|IS|NULL|NOT|REGEXP)\b/g;
export const SQL_STRINGS_REGEX  = /'[^']*'/g;
export const SQL_NUMBERS_REGEX  = /\b\d+(\.\d+)?\b/g;
export const JSON_TOKEN_REGEX   = /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|(\$\w+)/g;

export const PREVIEW_TABS = ['SQL', 'MongoDB', 'GraphQL'] as const;
export type PreviewTab = typeof PREVIEW_TABS[number];

export const RUN_QUERY_EVENT = 'queryforge:run-query' as const;
export const TOGGLE_DARK_MODE_EVENT = 'queryforge:toggle-dark-mode' as const;
export const OPEN_PRESETS_EVENT = 'queryforge:open-presets' as const;

export const MAX_HISTORY = 20;
export const MAX_PRESETS = 50;

export interface ShortcutEntry {
  action: string;
  keys: string[];
  available: boolean;
}

export const SHORTCUTS: ShortcutEntry[] = [
  { action: 'Run Query',             keys: ['Ctrl', 'Enter'], available: true  },
  { action: 'Undo last change',      keys: ['Ctrl', 'Z'],     available: true  },
  { action: 'Delete selected node',  keys: ['Delete'],        available: true  },
  { action: 'Toggle Dark Mode',      keys: ['Ctrl', 'D'],     available: true  },
  { action: 'Open this help modal',  keys: ['?'],             available: true  },
  { action: 'Save as preset',        keys: ['Ctrl', 'S'],     available: true  },
  { action: 'Import query',          keys: ['Ctrl', 'I'],     available: false },
  { action: 'Toggle Builder / JSON', keys: ['Ctrl', 'B'],     available: false },
];
