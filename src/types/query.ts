export type FieldType = 'string' | 'number' | 'enum' | 'date' | 'boolean' | 'array';

export type Operator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'inArray'
  | 'between'
  | 'regex'
  | 'isNull'
  | 'isNotNull'
  | 'before'
  | 'after';

export interface Rule {
  id: string;
  type: 'rule';
  field: string;
  operator: Operator;
  value: unknown;
}

export interface RuleGroup {
  id: string;
  type: 'group';
  logicalOperator: 'AND' | 'OR';
  children: QueryNode[];
}

export type QueryNode = Rule | RuleGroup;

export interface SchemaField {
  name: string;
  type: FieldType;
  options?: string[];
}

export interface Schema {
  name: string;
  fields: SchemaField[];
}


export interface HistoryEntry {
  id: string;
  tree: RuleGroup;
  timestamp: number;
  schemaName?: string;
}

export interface Preset {
  id: string;
  name: string;
  tree: RuleGroup;
  schemaName?: string;
  createdAt: number;
}
