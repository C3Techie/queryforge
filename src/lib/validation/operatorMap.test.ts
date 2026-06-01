import { describe, it, expect } from 'vitest'
import { OPERATOR_MAP, OPERATOR_LABELS } from '@/lib/constants'
import type { FieldType, Operator } from '@/types/query'

const FIELD_TYPES: FieldType[] = ['string', 'number', 'enum', 'date', 'boolean', 'array']
const ALL_OPERATORS = Object.keys(OPERATOR_LABELS) as Operator[]

describe('OPERATOR_MAP', () => {
  it('every field type has at least one operator', () => {
    FIELD_TYPES.forEach((type) => {
      expect(OPERATOR_MAP[type].length).toBeGreaterThan(0)
    })
  })

  it('every operator in the map is a valid Operator type', () => {
    FIELD_TYPES.forEach((type) => {
      OPERATOR_MAP[type].forEach((op) => {
        expect(ALL_OPERATORS).toContain(op)
      })
    })
  })

  it('every operator belongs to at least one field type', () => {
    const usedOperators = new Set(FIELD_TYPES.flatMap((t) => OPERATOR_MAP[t]))
    ALL_OPERATORS.forEach((op) => {
      expect(usedOperators.has(op)).toBe(true)
    })
  })

  it('string type includes contains and startsWith', () => {
    expect(OPERATOR_MAP.string).toContain('contains')
    expect(OPERATOR_MAP.string).toContain('startsWith')
  })

  it('number type does not include contains or startsWith', () => {
    expect(OPERATOR_MAP.number).not.toContain('contains')
    expect(OPERATOR_MAP.number).not.toContain('startsWith')
  })

  it('number type includes greaterThan and lessThan', () => {
    expect(OPERATOR_MAP.number).toContain('greaterThan')
    expect(OPERATOR_MAP.number).toContain('lessThan')
  })

  it('boolean type only has equals, notEquals, isNull, isNotNull', () => {
    expect(OPERATOR_MAP.boolean).toEqual(['equals', 'notEquals', 'isNull', 'isNotNull'])
  })

  it('date type includes before and after', () => {
    expect(OPERATOR_MAP.date).toContain('before')
    expect(OPERATOR_MAP.date).toContain('after')
  })

  it('all field types include isNull and isNotNull', () => {
    FIELD_TYPES.forEach((type) => {
      expect(OPERATOR_MAP[type]).toContain('isNull')
      expect(OPERATOR_MAP[type]).toContain('isNotNull')
    })
  })
})
