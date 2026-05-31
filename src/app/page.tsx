"use client"

import * as React from "react"
import { useEffect, useCallback } from "react"
import { useQueryStore } from "@/store/queryStore"
import { usersSchema } from "@/lib/mock/schema"
import { QueryNodeRenderer } from "@/components/query-builder/QueryNodeRenderer"
import { LivePreview } from "@/components/preview/LivePreview"
import { ResultsPanel } from "@/components/results/ResultsPanel"
import type { Rule, RuleGroup } from "@/types/query"

export default function Home() {
  const {
    queryTree,
    schema,
    setSchema,
    addRule,
    addGroup,
    updateNode,
    removeNode,
    setLogicalOperator,
  } = useQueryStore()

  // Set default schema on mount
  useEffect(() => {
    setSchema(usersSchema)
  }, [setSchema])

  // Stable callbacks
  const handleUpdate = useCallback(
    (id: string, updates: Partial<Rule | RuleGroup>) => updateNode(id, updates),
    [updateNode]
  )
  const handleRemove = useCallback(
    (id: string) => removeNode(id),
    [removeNode]
  )
  const handleAddRule = useCallback(
    (parentGroupId: string) => addRule(parentGroupId),
    [addRule]
  )
  const handleAddGroup = useCallback(
    (parentGroupId: string) => addGroup(parentGroupId),
    [addGroup]
  )
  const handleSetLogicalOperator = useCallback(
    (groupId: string, op: "AND" | "OR") => setLogicalOperator(groupId, op),
    [setLogicalOperator]
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">

      {/* Upper area: Center Panel & Right Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Center Panel — Query Builder Canvas */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-background transition-colors duration-200">

          {/* Canvas header */}
          <div className="flex justify-between items-center px-container-padding pt-6 pb-4 shrink-0">
            <h1 className="font-headline-md text-headline-md text-on-background">
              Query Rules
            </h1>
            <div className="flex gap-2 bg-surface-container rounded-lg p-1">
              <button className="px-3 py-1 rounded bg-surface shadow-sm font-label-caps text-label-caps text-on-surface">
                Builder
              </button>
              <button className="px-3 py-1 rounded font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors">
                JSON
              </button>
            </div>
          </div>

          {/* Root group card */}
          <div className="px-container-padding pb-container-padding flex-1">
            <div className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm min-h-full">
              {schema ? (
                <QueryNodeRenderer
                  node={queryTree}
                  schema={schema}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onAddRule={handleAddRule}
                  onAddGroup={handleAddGroup}
                  onSetLogicalOperator={handleSetLogicalOperator}
                />
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-body-sm">
                  Loading schema…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Query Results */}
        <ResultsPanel />

      </div>

      {/* Bottom Dock — Live Preview */}
      <LivePreview />

    </div>
  )
}
