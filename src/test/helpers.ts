import type { Rule, RuleGroup } from '@/types/query'

let idCounter = 0

export function makeRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: `rule-${++idCounter}`,
    type: 'rule',
    field: 'name',
    operator: 'equals',
    value: 'test',
    ...overrides,
  }
}

export function makeGroup(overrides: Partial<RuleGroup> = {}): RuleGroup {
  return {
    id: `group-${++idCounter}`,
    type: 'group',
    logicalOperator: 'AND',
    children: [],
    ...overrides,
  }
}
