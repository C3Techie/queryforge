import { describe, expect, it } from 'vitest'
import { parseImportedTree, sanitizeFieldPath, escapeRegexLiteral } from './querySafety'

describe('querySafety', () => {
  it('parses a valid deeply nested query tree', () => {
    const nestedTree = {
      id: 'root',
      type: 'group',
      logicalOperator: 'AND',
      children: [
        { id: 'r1', type: 'rule', field: 'age', operator: 'greaterThan', value: 18 },
        {
          id: 'g1',
          type: 'group',
          logicalOperator: 'OR',
          children: [{ id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' }],
        },
      ],
    }

    const parsed = parseImportedTree(nestedTree)
    expect(parsed.success).toBe(true)
  })

  it('rejects malformed recursive tree shapes', () => {
    const malformedTree = {
      id: 'root',
      type: 'group',
      logicalOperator: 'AND',
      children: [{ id: 'bad-child', type: 'group', children: [] }],
    }

    const parsed = parseImportedTree(malformedTree)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error).toMatch(/Invalid query tree shape/)
    }
  })

  it('sanitizes valid dotted field paths', () => {
    expect(sanitizeFieldPath('customer.status')).toBe('customer.status')
  })

  it('rejects field paths containing SQL syntax tokens', () => {
    expect(sanitizeFieldPath('status; DROP TABLE users;')).toBeNull()
  })

  it('escapes regex special characters safely', () => {
    expect(escapeRegexLiteral('a+b?(c)')).toBe('a\\+b\\?\\(c\\)')
  })
})
