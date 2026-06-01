import type { QueryNode, Rule, RuleGroup, Schema, Operator } from '@/types/query';
import { getReferencedFields } from '@/lib/schemaUtils';
import { schemas as defaultSchemas } from '@/lib/mock/schema';
import { datasetMap as defaultDb } from '@/lib/mock/dataset';

type DataRow = Record<string, unknown>;

function guessSchema(data: DataRow[], schemas: Schema[]): Schema {
  if (data.length === 0) return schemas[0];
  const firstRowKeys = Object.keys(data[0]);
  let bestSchema = schemas[0];
  let maxMatches = -1;
  
  for (const s of schemas) {
    const matches = s.fields.filter(f => firstRowKeys.includes(f.name)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestSchema = s;
    }
  }
  return bestSchema;
}

export function resolveFieldValue(
  row: DataRow,
  fieldPath: string,
  schema: Schema,
  db: Record<string, DataRow[]>,
  schemas: Schema[]
): unknown {
  if (!fieldPath) return undefined;

  const parts = fieldPath.split('.');
  if (parts.length === 1) {
    return row[parts[0]];
  }

  const relationName = parts[0];
  const relation = schema.relations?.find((r) => r.name === relationName);
  if (!relation) return undefined;

  const nextSchema = schemas.find((s) => s.name === relation.targetSchema);
  if (!nextSchema) return undefined;

  const targetDataset = db[relation.targetSchema];
  if (!targetDataset) return undefined;

  const localVal = row[relation.localField];
  if (localVal === undefined || localVal === null) return undefined;

  const matches = targetDataset.filter(
    (targetRow) => String(targetRow[relation.foreignField]) === String(localVal)
  );

  const subPath = parts.slice(1).join('.');
  if (matches.length === 0) return undefined;

  const isOneToMany = relation.localField === 'id';

  if (isOneToMany) {
    const results = matches
      .map((m) => resolveFieldValue(m, subPath, nextSchema, db, schemas))
      .filter((v) => v !== undefined);
    return results;
  } else {
    return resolveFieldValue(matches[0], subPath, nextSchema, db, schemas);
  }
}

function evaluateSingleValue(operator: Operator, rawField: unknown, rawValue: unknown): boolean {
  switch (operator) {
    case 'isNull':
      return rawField === null || rawField === undefined;

    case 'isNotNull':
      return rawField !== null && rawField !== undefined;

    case 'equals':
      return String(rawField) == String(rawValue);

    case 'notEquals':
      return String(rawField) != String(rawValue);

    case 'contains':
      return String(rawField).toLowerCase().includes(String(rawValue).toLowerCase());

    case 'startsWith':
      return String(rawField).toLowerCase().startsWith(String(rawValue).toLowerCase());

    case 'greaterThan':
      return Number(rawField) > Number(rawValue);

    case 'lessThan':
      return Number(rawField) < Number(rawValue);

    case 'inArray': {
      const items = Array.isArray(rawValue)
        ? rawValue.map((v) => String(v).trim().toLowerCase())
        : String(rawValue).split(',').map((s) => s.trim().toLowerCase());
      return items.includes(String(rawField).toLowerCase());
    }

    case 'between': {
      const parts = Array.isArray(rawValue) ? rawValue : [rawValue, rawValue];
      const fieldNum = Number(rawField);
      if (!isNaN(fieldNum)) {
        return fieldNum >= Number(parts[0]) && fieldNum <= Number(parts[1]);
      }
      return String(rawField) >= String(parts[0]) && String(rawField) <= String(parts[1]);
    }

    case 'before':
      return String(rawField) < String(rawValue);

    case 'after':
      return String(rawField) > String(rawValue);

    case 'regex': {
      try {
        return new RegExp(String(rawValue), 'i').test(String(rawField));
      } catch {
        return false;
      }
    }

    default:
      return true;
  }
}

function evaluateRule(
  rule: Rule,
  row: DataRow,
  schema: Schema,
  db: Record<string, DataRow[]>,
  schemas: Schema[]
): boolean {
  const resolvedValue = resolveFieldValue(row, rule.field, schema, db, schemas);

  if (Array.isArray(resolvedValue)) {
    return resolvedValue.some((val) => evaluateSingleValue(rule.operator, val, rule.value));
  }

  return evaluateSingleValue(rule.operator, resolvedValue, rule.value);
}

export function executeTree(
  node: QueryNode,
  data: DataRow[],
  schema?: Schema,
  db: Record<string, DataRow[]> = defaultDb,
  schemas: Schema[] = defaultSchemas
): DataRow[] {
  const activeSchema = schema ?? guessSchema(data, schemas);

  if (node.type === 'rule') {
    if (!node.field) return data;
    return data.filter((row) => evaluateRule(node, row, activeSchema, db, schemas));
  }

  // RuleGroup
  const group = node as RuleGroup;

  if (group.children.length === 0) return data;

  if (group.logicalOperator === 'AND') {
    let result = data;
    for (const child of group.children) {
      result = executeTree(child, result, activeSchema, db, schemas);
    }
    return result;
  } else {
    const seen = new Set<unknown>();
    const result: DataRow[] = [];
    for (const child of group.children) {
      for (const row of executeTree(child, data, activeSchema, db, schemas)) {
        if (!seen.has(row)) {
          seen.add(row);
          result.push(row);
        }
      }
    }
    return result;
  }
}

export interface QueryResult {
  rows: DataRow[];
  total: number;
  matched: number;
}

export function runQuery(
  tree: RuleGroup,
  data: DataRow[],
  schema?: Schema,
  db: Record<string, DataRow[]> = defaultDb,
  schemas: Schema[] = defaultSchemas
): QueryResult {
  const activeSchema = schema ?? guessSchema(data, schemas);
  const matchedRows = executeTree(tree, data, activeSchema, db, schemas);
  const refFields = getReferencedFields(tree);

  const enrichedRows = matchedRows.map((row) => {
    const enriched = { ...row };
    for (const fieldPath of refFields) {
      if (fieldPath.includes('.')) {
        enriched[fieldPath] = resolveFieldValue(row, fieldPath, activeSchema, db, schemas);
      }
    }
    return enriched;
  });

  return {
    rows: enrichedRows,
    total: data.length,
    matched: matchedRows.length,
  };
}
