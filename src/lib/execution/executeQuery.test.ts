import { describe, it, expect } from 'vitest'
import { executeTree, runQuery } from './executeQuery'
import { makeRule, makeGroup } from '@/test/helpers'
import { usersDataset, ordersDataset } from '@/lib/mock/dataset'
import { ordersSchema, usersSchema } from '@/lib/mock/schema'

type Row = Record<string, unknown>
const data = usersDataset as unknown as Row[]

describe('executeTree', () => {
  it('empty group returns all rows', () => {
    const group = makeGroup()
    expect(executeTree(group, data)).toHaveLength(data.length)
  })

  it('greaterThan filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '50' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.age as number) > 50)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('lessThan filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'lessThan', value: '20' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.age as number) < 20)).toBe(true)
  })

  it('equals filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'status', operator: 'equals', value: 'active' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => r.status === 'active')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('notEquals filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'status', operator: 'notEquals', value: 'active' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => r.status !== 'active')).toBe(true)
  })

  it('contains filters case-insensitively', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'son' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.name as string).toLowerCase().includes('son'))).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('startsWith filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'name', operator: 'startsWith', value: 'A' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.name as string).startsWith('A'))).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('inArray filters correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'status', operator: 'inArray', value: 'active, pending' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => r.status === 'active' || r.status === 'pending')).toBe(true)
  })

  it('between filters numeric range', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'between', value: ['25', '35'] })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.age as number) >= 25 && (r.age as number) <= 35)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('isNull returns rows where field is null/undefined', () => {
    const rowsWithNull = [
      { id: 1, name: null },
      { id: 2, name: 'Alice' },
    ]
    const group = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNull', value: '' })],
    })
    const result = executeTree(group, rowsWithNull)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('isNotNull returns rows where field is not null', () => {
    const rowsWithNull = [
      { id: 1, name: null },
      { id: 2, name: 'Alice' },
    ]
    const group = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNotNull', value: '' })],
    })
    const result = executeTree(group, rowsWithNull)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('before filters date strings correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'createdAt', operator: 'before', value: '2021-01-01' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.createdAt as string) < '2021-01-01')).toBe(true)
  })

  it('after filters date strings correctly', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'createdAt', operator: 'after', value: '2023-01-01' })],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.createdAt as string) > '2023-01-01')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('AND group intersects results of two rules', () => {
    const group = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '25' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => (r.age as number) > 25 && r.status === 'active')).toBe(true)
  })

  it('OR group unions results without duplicates', () => {
    const group = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'status', operator: 'equals', value: 'inactive' }),
        makeRule({ field: 'status', operator: 'equals', value: 'pending' }),
      ],
    })
    const result = executeTree(group, data)
    expect(result.every((r) => r.status === 'inactive' || r.status === 'pending')).toBe(true)
    // No duplicates
    const ids = result.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('nested AND/OR logic works correctly', () => {
    // name contains 'a' AND (status = active OR age < 25)
    const inner = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
        makeRule({ field: 'age', operator: 'lessThan', value: '25' }),
      ],
    })
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'name', operator: 'contains', value: 'a' }),
        inner,
      ],
    })
    const result = executeTree(root, data)
    result.forEach((r) => {
      expect((r.name as string).toLowerCase()).toContain('a')
      expect(r.status === 'active' || (r.age as number) < 25).toBe(true)
    })
  })

  it('returns empty array when no rows match', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '999' })],
    })
    expect(executeTree(group, data)).toHaveLength(0)
  })
})

describe('runQuery', () => {
  it('returns total, matched, and rows', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'status', operator: 'equals', value: 'active' })],
    })
    const result = runQuery(group, data)
    expect(result.total).toBe(data.length)
    expect(result.matched).toBe(result.rows.length)
    expect(result.matched).toBeGreaterThan(0)
  })
})

describe('runQuery with JOIN/relations', () => {
  it('correctly executes many-to-one join filter (Orders -> customer.status = active)', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'customer.status', operator: 'equals', value: 'active' })],
    })
    
    const result = runQuery(group, ordersDataset as any, ordersSchema)
    
    expect(result.matched).toBeGreaterThan(0)
    expect(result.matched).toBeLessThan(ordersDataset.length)
    
    result.rows.forEach(row => {
      expect(row['customer.status']).toBe('active')
    })
  })

  it('correctly executes one-to-many join filter (Users -> orders.total > 500)', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'orders.total', operator: 'greaterThan', value: '500' })],
    })
    
    const result = runQuery(group, data, usersSchema)
    
    expect(result.matched).toBeGreaterThan(0)
    expect(result.matched).toBeLessThan(data.length)
    
    result.rows.forEach(row => {
      const totals = row['orders.total'] as number[]
      expect(Array.isArray(totals)).toBe(true)
      expect(totals.some(t => t > 500)).toBe(true)
    })
  })
})
