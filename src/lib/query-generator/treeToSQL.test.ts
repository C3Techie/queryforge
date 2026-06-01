import { describe, it, expect } from 'vitest'
import { treeToSQL } from './treeToSQL'
import { makeRule, makeGroup } from '@/test/helpers'
import { usersSchema, ordersSchema } from '@/lib/mock/schema'

describe('treeToSQL', () => {
  it('returns SELECT without WHERE for empty root group', () => {
    const root = makeGroup()
    expect(treeToSQL(root, usersSchema)).toBe('SELECT * FROM `Users`;')
  })

  it('single greaterThan rule on number field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '18' })],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain('WHERE `age` > 18')
  })

  it('single equals rule on string field wraps value in quotes', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'equals', value: 'Alice' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("`name` = 'Alice'")
  })

  it('AND group joins two rules with AND', () => {
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '18' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain('`age` > 18 AND `status` = \'active\'')
  })

  it('OR group joins rules with OR', () => {
    const root = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'lessThan', value: '20' }),
        makeRule({ field: 'age', operator: 'greaterThan', value: '50' }),
      ],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain('`age` < 20 OR `age` > 50')
  })

  it('nested OR group inside AND root wraps nested in parentheses', () => {
    const nested = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '25' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'name', operator: 'contains', value: 'John' }),
        nested,
      ],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain("LIKE '%John%'")
    expect(sql).toContain('(`age` > 25 OR `status` = \'active\')')
  })

  it('contains operator produces LIKE with wildcards', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("`name` LIKE '%John%'")
  })

  it('startsWith operator produces LIKE with trailing wildcard', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'email', operator: 'startsWith', value: 'alice' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("`email` LIKE 'alice%'")
  })

  it('inArray operator with comma-separated string', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'inArray', value: 'active, inactive' })],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain('`status` IN (')
    expect(sql).toContain("'active'")
    expect(sql).toContain("'inactive'")
  })

  it('between operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'between', value: ['20', '40'] })],
    })
    expect(treeToSQL(root, usersSchema)).toContain('`age` BETWEEN 20 AND 40')
  })

  it('isNull operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNull', value: '' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain('`name` IS NULL')
  })

  it('isNotNull operator', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNotNull', value: '' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain('`name` IS NOT NULL')
  })

  it('before operator on date field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'createdAt', operator: 'before', value: '2024-01-01' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("`createdAt` < '2024-01-01'")
  })

  it('after operator on date field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'createdAt', operator: 'after', value: '2020-01-01' })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("`createdAt` > '2020-01-01'")
  })

  it('deep nesting (3 levels) produces correct parentheses', () => {
    const level3 = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '60' }),
        makeRule({ field: 'isVerified', operator: 'equals', value: 'true' }),
      ],
    })
    const level2 = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
        level3,
      ],
    })
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'name', operator: 'contains', value: 'A' }),
        level2,
      ],
    })
    const sql = treeToSQL(root, usersSchema)
    expect(sql).toContain('WHERE')
    // Nested groups should be wrapped in parens
    expect(sql.match(/\(/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('escapes single quotes in string values', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'equals', value: "O'Brien" })],
    })
    expect(treeToSQL(root, usersSchema)).toContain("'O''Brien'")
  })

  it('generates JOIN clause for relational fields', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'customer.status', operator: 'equals', value: 'active' })],
    })
    const sql = treeToSQL(root, ordersSchema)
    expect(sql).toContain('JOIN `Users` AS `customer` ON `Orders`.`customerId` = `customer`.`id`')
    expect(sql).toContain("WHERE `customer`.`status` = 'active'")
  })
})
