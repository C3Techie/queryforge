"use client"

import * as React from "react"
import { RuleRow } from "./RuleRow"
import { GroupContainer } from "./GroupContainer"
import type { QueryNode, Rule, RuleGroup, Schema } from "@/types/query"

interface QueryNodeRendererProps {
  node: QueryNode
  schema: Schema
  onUpdate: (id: string, updates: Partial<Rule | RuleGroup>) => void
  onRemove: (id: string) => void
  onAddRule: (parentGroupId: string) => void
  onAddGroup: (parentGroupId: string) => void
  onSetLogicalOperator: (groupId: string, op: "AND" | "OR") => void
}


function QueryNodeRendererInner({
  node,
  schema,
  onUpdate,
  onRemove,
  onAddRule,
  onAddGroup,
  onSetLogicalOperator,
}: QueryNodeRendererProps) {
  if (node.type === "rule") {
    return (
      <RuleRow
        rule={node}
        schema={schema}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )
  }

  return (
    <GroupContainer
      group={node}
      schema={schema}
      onUpdate={onUpdate}
      onRemove={onRemove}
      onAddRule={onAddRule}
      onAddGroup={onAddGroup}
      onSetLogicalOperator={onSetLogicalOperator}
    />
  )
}

export const QueryNodeRenderer = React.memo(QueryNodeRendererInner)
