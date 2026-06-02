import { describe, it, expect } from 'vitest'
import { validateNode } from './validateNode'
import { makeRule, makeGroup } from '@/test/helpers'
import { usersSchema, ordersSchema } from '@/lib/mock/schema'

describe('validateNode — rules', () => {
  it('valid rule returns no errors', () => {
    const rule = makeRule({ field: 'age', operator: 'greaterThan', value: '25' })
    expect(validateNode(rule, usersSchema)).toEqual([])
  })

  it('invalid operator for field type returns error', () => {
    // 'contains' is not allowed on number fields
    const rule = makeRule({ field: 'age', operator: 'contains', value: '25' })
    const errors = validateNode(rule, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/not allowed/)
  })

  it('non-existent field returns error', () => {
    const rule = makeRule({ field: 'nonExistentField', operator: 'equals', value: 'x' })
    const errors = validateNode(rule, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/does not exist/)
  })

  it('missing value for equals operator returns error', () => {
    const rule = makeRule({ field: 'name', operator: 'equals', value: '' })
    const errors = validateNode(rule, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/value is required/)
  })

  it('null value for operator requiring value returns error', () => {
    const rule = makeRule({ field: 'age', operator: 'greaterThan', value: null })
    const errors = validateNode(rule, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('isNull with no value is valid (no value required)', () => {
    const rule = makeRule({ field: 'name', operator: 'isNull', value: '' })
    expect(validateNode(rule, usersSchema)).toEqual([])
  })

  it('isNotNull with no value is valid', () => {
    const rule = makeRule({ field: 'name', operator: 'isNotNull', value: null })
    expect(validateNode(rule, usersSchema)).toEqual([])
  })

  it('valid enum rule with equals returns no errors', () => {
    const rule = makeRule({ field: 'status', operator: 'equals', value: 'active' })
    expect(validateNode(rule, usersSchema)).toEqual([])
  })

  it('greaterThan on string field returns error', () => {
    const rule = makeRule({ field: 'name', operator: 'greaterThan', value: 'Alice' })
    const errors = validateNode(rule, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/not allowed/)
  })

  it('rejects invalid date value for date field', () => {
    const rule = makeRule({ field: 'createdAt', operator: 'before', value: 'not-a-date' })
    const errors = validateNode(rule, usersSchema)
    expect(errors.some((e) => /not a valid date/.test(e))).toBe(true)
  })

  it('rejects invalid date range ordering for between', () => {
    const rule = makeRule({
      field: 'createdAt',
      operator: 'between',
      value: ['2025-12-31', '2024-01-01'],
    })
    const errors = validateNode(rule, usersSchema)
    expect(errors.some((e) => /start date must be before end date/.test(e))).toBe(true)
  })
})

describe('validateNode — groups', () => {
  it('empty group returns error', () => {
    const group = makeGroup({ children: [] })
    const errors = validateNode(group, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/at least one condition/)
  })

  it('group with valid rule returns no errors', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '18' })],
    })
    expect(validateNode(group, usersSchema)).toEqual([])
  })

  it('group with invalid rule returns errors', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'contains', value: '25' })],
    })
    expect(validateNode(group, usersSchema).length).toBeGreaterThan(0)
  })

  it('nested group with invalid rule deep inside returns error recursively', () => {
    const deepInvalid = makeRule({ field: 'age', operator: 'contains', value: '5' })
    const inner = makeGroup({ children: [deepInvalid] })
    const outer = makeGroup({ children: [inner] })
    const errors = validateNode(outer, usersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/not allowed/)
  })

  it('nested group with all valid rules returns no errors', () => {
    const inner = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '25' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const outer = makeGroup({
      children: [
        makeRule({ field: 'name', operator: 'contains', value: 'John' }),
        inner,
      ],
    })
    expect(validateNode(outer, usersSchema)).toEqual([])
  })
})

describe('validateNode — relational fields', () => {
  it('valid relational field path returns no errors', () => {
    const rule = makeRule({ field: 'customer.status', operator: 'equals', value: 'active' })
    expect(validateNode(rule, ordersSchema)).toEqual([])
  })

  it('invalid operator on relational field returns error', () => {
    const rule = makeRule({ field: 'customer.status', operator: 'greaterThan', value: '10' })
    const errors = validateNode(rule, ordersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/not allowed/)
  })

  it('invalid relational path returns error', () => {
    const rule = makeRule({ field: 'customer.nonExistent', operator: 'equals', value: 'active' })
    const errors = validateNode(rule, ordersSchema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/does not exist/)
  })
})
