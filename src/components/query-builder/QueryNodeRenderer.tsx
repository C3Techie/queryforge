"use client"

import * as React from "react"
import { RuleRow } from "./RuleRow"
import { GroupContainer } from "./GroupContainer"
import type { QueryNode, Rule, RuleGroup, Schema } from "@/types/query"

interface QueryNodeRendererProps {
  node: QueryNode
  schema: Schema
  dragHandle?: React.ReactNode
  onUpdate: (id: string, updates: Partial<Rule | RuleGroup>) => void
  onRemove: (id: string) => void
  onAddRule: (parentGroupId: string) => void
  onAddGroup: (parentGroupId: string) => void
  onSetLogicalOperator: (groupId: string, op: "AND" | "OR") => void
  onReorderChildren: (parentGroupId: string, fromIndex: number, toIndex: number) => void
}


function QueryNodeRendererInner({
  node,
  schema,
  dragHandle,
  onUpdate,
  onRemove,
  onAddRule,
  onAddGroup,
  onSetLogicalOperator,
  onReorderChildren,
}: QueryNodeRendererProps) {
  if (node.type === "rule") {
    return (
      <RuleRow
        rule={node}
        schema={schema}
        dragHandle={dragHandle}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )
  }

  return (
    <GroupContainer
      group={node}
      schema={schema}
      dragHandle={dragHandle}
      onUpdate={onUpdate}
      onRemove={onRemove}
      onAddRule={onAddRule}
      onAddGroup={onAddGroup}
      onSetLogicalOperator={onSetLogicalOperator}
      onReorderChildren={onReorderChildren}
    />
  )
}

export const QueryNodeRenderer = React.memo(QueryNodeRendererInner)
