import type { QueryNode, Rule, RuleGroup } from '@/types/query';


type DataRow = Record<string, unknown>;


function evaluateRule(rule: Rule, row: DataRow): boolean {
  const rawField = row[rule.field];
  const rawValue = rule.value;

  switch (rule.operator) {
    case 'isNull':
      return rawField === null || rawField === undefined;

    case 'isNotNull':
      return rawField !== null && rawField !== undefined;

    case 'equals':
      // loose comparison to handle string "true"/"false" vs boolean
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
      // Try numeric first, fall back to date string comparison
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


export function executeTree(node: QueryNode, data: DataRow[]): DataRow[] {
  if (node.type === 'rule') {
    // Skip incomplete rules (no field selected)
    if (!node.field) return data;
    return data.filter((row) => evaluateRule(node, row));
  }

  // RuleGroup
  const group = node as RuleGroup;

  if (group.children.length === 0) return data;

  if (group.logicalOperator === 'AND') {
    let result = data;
    for (const child of group.children) {
      result = executeTree(child, result);
    }
    return result;
  } else {
    const seen = new Set<unknown>();
    const result: DataRow[] = [];
    for (const child of group.children) {
      for (const row of executeTree(child, data)) {
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
  data: DataRow[]
): QueryResult {
  const rows = executeTree(tree, data);
  return {
    rows,
    total: data.length,
    matched: rows.length,
  };
}
