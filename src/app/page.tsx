"use client"

import * as React from "react"
import { useEffect, useCallback } from "react"
import { Database, Eye } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { usersSchema } from "@/lib/mock/schema"
import { QueryNodeRenderer } from "@/components/query-builder/QueryNodeRenderer"
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

        {/* Right Panel (Query Results — Desktop only) */}
        <div className="hidden md:flex w-[320px] lg:w-[400px] border-l border-outline-variant dark:border-outline bg-surface dark:bg-surface-dim shrink-0 flex-col items-center justify-center p-6 text-center transition-colors duration-200">
          <div className="p-3 bg-surface-container-high dark:bg-surface-container-highest rounded-full mb-3">
            <Database className="size-6 text-primary dark:text-primary-fixed-dim" />
          </div>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1">
            Results Workspace
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-75 max-w-[280px] leading-relaxed">
            Run, profile, and audit matching records in real-time. Results and
            database records will populate this panel.
          </p>
        </div>

      </div>

      {/* Bottom Dock Panel (Live Preview — Desktop only) */}
      <div className="hidden md:flex h-48 border-t border-outline-variant dark:border-outline bg-surface-container-lowest dark:bg-surface-container-lowest shrink-0 items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-surface-container dark:bg-surface-container-high rounded">
              <Eye className="size-4.5 text-primary dark:text-primary-fixed-dim" />
            </div>
            <span className="font-label-caps text-label-caps text-on-surface font-bold uppercase tracking-wider">
              Live Preview &amp; Syntax Compiler
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-75 leading-relaxed">
            The instant code compiler output (SQL, JSON rules) will render here
            continuously as rules change in the canvas.
          </p>
        </div>
      </div>

    </div>
  )
}
