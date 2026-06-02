import { z } from 'zod'
import type { Operator, RuleGroup, Schema } from '@/types/query'
import { OPERATOR_MAP } from '@/lib/constants'
import { getFieldMetadata } from '@/lib/schemaUtils'
import { schemas as defaultSchemas } from '@/lib/mock/schema'

const FIELD_PATH_SEGMENT_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/

const ruleSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.literal('rule'),
    // Allow empty field for incomplete builder states (validated later by validateNode).
    field: z.string(),
    operator: z.enum([
      'equals',
      'notEquals',
      'contains',
      'startsWith',
      'greaterThan',
      'lessThan',
      'inArray',
      'between',
      'regex',
      'isNull',
      'isNotNull',
      'before',
      'after',
    ]),
    value: z.unknown(),
  })
)

const queryNodeSchema: z.ZodType = z.lazy(() =>
  z.union([
    ruleSchema,
    z.object({
      id: z.string().min(1),
      type: z.literal('group'),
      logicalOperator: z.enum(['AND', 'OR']),
      children: z.array(queryNodeSchema),
    }),
  ])
)

const ruleGroupSchema = z.object({
  id: z.string().min(1),
  type: z.literal('group'),
  logicalOperator: z.enum(['AND', 'OR']),
  children: z.array(queryNodeSchema),
})

export function parseImportedTree(input: unknown):
  | { success: true; data: RuleGroup }
  | { success: false; error: string } {
  const result = ruleGroupSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: 'Invalid query tree shape. Ensure all groups/rules are well-formed.' }
  }
  return { success: true, data: result.data as RuleGroup }
}

export function sanitizeFieldPath(fieldPath: string): string | null {
  const parts = fieldPath.split('.').map((part) => part.trim())
  if (parts.length === 0 || parts.some((part) => !FIELD_PATH_SEGMENT_REGEX.test(part))) {
    return null
  }
  return parts.join('.')
}

export function toSafeSqlIdentifier(fieldPath: string): string {
  return fieldPath.split('.').map((part) => `\`${part}\``).join('.')
}

export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''")
}

export function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function isAllowedOperatorForField(
  fieldPath: string,
  operator: Operator,
  schema: Schema,
  schemas: Schema[] = defaultSchemas
): boolean {
  const metadata = getFieldMetadata(fieldPath, schema, schemas)
  if (!metadata) return false
  return OPERATOR_MAP[metadata.type].includes(operator)
}
