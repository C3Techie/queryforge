import { describe, it, expect } from 'vitest'
import { usersDataset } from './dataset'
import { usersSchema } from './schema'

describe('usersDataset', () => {
  it('has at least 20 entries', () => {
    expect(usersDataset.length).toBeGreaterThanOrEqual(20)
  })

  it('every record has all schema field keys', () => {
    const schemaFieldNames = usersSchema.fields.map((f) => f.name)
    usersDataset.forEach((record) => {
      schemaFieldNames.forEach((field) => {
        expect(record).toHaveProperty(field)
      })
    })
  })

  it('id values are unique', () => {
    const ids = usersDataset.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('status values are valid enum options', () => {
    const validStatuses = ['active', 'inactive', 'pending']
    usersDataset.forEach((r) => {
      expect(validStatuses).toContain(r.status)
    })
  })

  it('isVerified is a boolean on every record', () => {
    usersDataset.forEach((r) => {
      expect(typeof r.isVerified).toBe('boolean')
    })
  })

  it('tags is an array on every record', () => {
    usersDataset.forEach((r) => {
      expect(Array.isArray(r.tags)).toBe(true)
    })
  })

  it('age is a positive number on every record', () => {
    usersDataset.forEach((r) => {
      expect(typeof r.age).toBe('number')
      expect(r.age).toBeGreaterThan(0)
    })
  })

  it('dataset has diverse statuses (not all the same)', () => {
    const statuses = new Set(usersDataset.map((r) => r.status))
    expect(statuses.size).toBeGreaterThan(1)
  })

  it('dataset has both verified and unverified users', () => {
    const verified = usersDataset.filter((r) => r.isVerified)
    const unverified = usersDataset.filter((r) => !r.isVerified)
    expect(verified.length).toBeGreaterThan(0)
    expect(unverified.length).toBeGreaterThan(0)
  })
})

describe('usersSchema', () => {
  it('has a name', () => {
    expect(usersSchema.name).toBe('Users')
  })

  it('has 8 fields', () => {
    expect(usersSchema.fields).toHaveLength(8)
  })

  it('status field has enum options', () => {
    const statusField = usersSchema.fields.find((f) => f.name === 'status')
    expect(statusField?.type).toBe('enum')
    expect(statusField?.options).toEqual(['active', 'inactive', 'pending'])
  })

  it('all expected fields are present', () => {
    const names = usersSchema.fields.map((f) => f.name)
    expect(names).toContain('id')
    expect(names).toContain('name')
    expect(names).toContain('email')
    expect(names).toContain('age')
    expect(names).toContain('status')
    expect(names).toContain('createdAt')
    expect(names).toContain('tags')
    expect(names).toContain('isVerified')
  })
})
