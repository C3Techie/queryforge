import { describe, it, expect } from 'vitest'
import { treeToGraphQL } from './treeToGraphQL'
import { makeRule, makeGroup } from '@/test/helpers'
import { usersSchema } from '@/lib/mock/schema'

describe('treeToGraphQL', () => {
  it('returns empty object for empty root group', () => {
    expect(treeToGraphQL(makeGroup(), usersSchema)).toEqual({})
  })

  it('equals rule produces { eq: value }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'equals', value: '25' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { age: { eq: number } }[] }
    expect(result.AND[0].age.eq).toBe(25)
  })

  it('greaterThan rule produces { gt: value }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'greaterThan', value: '18' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { age: { gt: number } }[] }
    expect(result.AND[0].age.gt).toBe(18)
  })

  it('lessThan rule produces { lt: value }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'lessThan', value: '65' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { age: { lt: number } }[] }
    expect(result.AND[0].age.lt).toBe(65)
  })

  it('contains rule produces { contains: value }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'contains', value: 'John' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { name: { contains: string } }[] }
    expect(result.AND[0].name.contains).toBe('John')
  })

  it('inArray rule produces { in: [...] }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'status', operator: 'inArray', value: 'active, pending' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { status: { in: string[] } }[] }
    expect(result.AND[0].status.in).toEqual(['active', 'pending'])
  })

  it('between rule produces { gte, lte }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'age', operator: 'between', value: ['20', '40'] })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { age: { gte: number; lte: number } }[] }
    expect(result.AND[0].age.gte).toBe(20)
    expect(result.AND[0].age.lte).toBe(40)
  })

  it('isNull rule produces { isNull: true }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNull', value: '' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { name: { isNull: boolean } }[] }
    expect(result.AND[0].name.isNull).toBe(true)
  })

  it('isNotNull rule produces { isNull: false }', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name', operator: 'isNotNull', value: '' })],
    })
    const result = treeToGraphQL(root, usersSchema) as { AND: { name: { isNull: boolean } }[] }
    expect(result.AND[0].name.isNull).toBe(false)
  })

  it('AND group produces { AND: [...] }', () => {
    const root = makeGroup({
      logicalOperator: 'AND',
      children: [
        makeRule({ field: 'age', operator: 'greaterThan', value: '18' }),
        makeRule({ field: 'status', operator: 'equals', value: 'active' }),
      ],
    })
    expect(treeToGraphQL(root, usersSchema)).toHaveProperty('AND')
  })

  it('OR group produces { OR: [...] }', () => {
    const root = makeGroup({
      logicalOperator: 'OR',
      children: [
        makeRule({ field: 'age', operator: 'lessThan', value: '20' }),
        makeRule({ field: 'age', operator: 'greaterThan', value: '50' }),
      ],
    })
    expect(treeToGraphQL(root, usersSchema)).toHaveProperty('OR')
  })

  it('nested groups produce nested AND/OR', () => {
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
    const result = treeToGraphQL(root, usersSchema) as { AND: unknown[] }
    expect(result.AND).toHaveLength(2)
    expect(result.AND[1]).toHaveProperty('OR')
  })

  it('returns invalid marker for unsafe field paths', () => {
    const root = makeGroup({
      children: [makeRule({ field: 'name;delete from users', operator: 'equals', value: 'x' })],
    })
    expect(treeToGraphQL(root, usersSchema)).toEqual({ AND: [{ _invalid: true }] })
  })
})
