import { describe, it, expect } from 'vitest'
import { treeToMongo } from './treeToMongo'
import { makeRule, makeGroup } from '@/test/helpers'
import { usersSchema } from '@/lib/mock/schema'

describe('treeToMongo', () => {
  it('returns empty object for empty root group', () => {
    expect(treeToMongo(makeGroup(), usersSchema)).toEqual({})
  })

  it('equals rule on number field coerces to number', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'equals', value: '25' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ age: 25 }] })
  })

  it('notEquals rule', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'notEquals', value: 'inactive' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ status: { $ne: 'inactive' } }] })
  })

  it('greaterThan rule', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '18' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ age: { $gt: 18 } }] })
  })

  it('lessThan rule', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'lessThan', value: '65' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ age: { $lt: 65 } }] })
  })

  it('contains rule produces $regex', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' })],
    })
    const result = treeToMongo(root, usersSchema) as { $and: { name: { $regex: string; $options: string } }[] }
    expect(result.$and[0].name.$regex).toBe('John')
    expect(result.$and[0].name.$options).toBe('i')
  })

  it('startsWith rule produces anchored $regex', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'email', operator: 'startsWith', value: 'alice' })],
    })
    const result = treeToMongo(root, usersSchema) as { $and: { email: { $regex: string } }[] }
    expect(result.$and[0].email.$regex).toBe('^alice')
  })

  it('escapes regex metacharacters for contains and startsWith', () => {
    const containsRoot = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'a+b?' })],
    })
    const startsWithRoot = makeGroup({
      children: [makeRule({ field: 'name', operator: 'startsWith', value: '(admin)' })],
    })
    const containsResult = treeToMongo(containsRoot, usersSchema) as { $and: { name: { $regex: string } }[] }
    const startsWithResult = treeToMongo(startsWithRoot, usersSchema) as { $and: { name: { $regex: string } }[] }

    expect(containsResult.$and[0].name.$regex).toBe('a\\+b\\?')
    expect(startsWithResult.$and[0].name.$regex).toBe('^\\(admin\\)')
  })

  it('inArray rule produces $in array', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'inArray', value: 'active, pending' })],
    })
    const result = treeToMongo(root, usersSchema) as { $and: { status: { $in: string[] } }[] }
    expect(result.$and[0].status.$in).toEqual(['active', 'pending'])
  })

  it('between rule produces $gte and $lte', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'between', value: ['20', '40'] })],
    })
    const result = treeToMongo(root, usersSchema) as { $and: { age: { $gte: number; $lte: number } }[] }
    expect(result.$and[0].age.$gte).toBe(20)
    expect(result.$and[0].age.$lte).toBe(40)
  })

  it('isNull rule produces null value', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNull', value: '' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ name: null }] })
  })

  it('isNotNull rule produces $ne null', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNotNull', value: '' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({ $and: [{ name: { $ne: null } }] })
  })

  it('OR group produces $or', () => {
    const root = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'lessThan', value: '20' }),
        makeRule({ field: 'age', operator: 'greaterThan', value: '50' }),
      ],
    })
    const result = treeToMongo(root, usersSchema)
    expect(result).toHaveProperty('$or')
  })

  it('AND group produces $and', () => {
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '18' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const result = treeToMongo(root, usersSchema)
    expect(result).toHaveProperty('$and')
  })

  it('nested groups produce nested $and/$or', () => {
    const nested = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '25' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' }), nested],
    })
    const result = treeToMongo(root, usersSchema) as { $and: unknown[] }
    expect(result.$and).toHaveLength(2)
    expect(result.$and[1]).toHaveProperty('$or')
  })

  it('before/after operators on date field', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'createdAt', operator: 'before', value: '2024-01-01' })],
    })
    const result = treeToMongo(root, usersSchema) as { $and: { createdAt: { $lt: string } }[] }
    expect(result.$and[0].createdAt.$lt).toBe('2024-01-01')
  })

  it('returns fail-closed filter for unsafe field paths', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name;drop table users', operator: 'equals', value: 'x' })],
    })
    expect(treeToMongo(root, usersSchema)).toEqual({
      $and: [{ $expr: { $eq: [1, 0] } }],
    })
  })
})
