"use client"

import * as React from "react"
import { useEffect, useCallback, useState } from "react"
import { Play } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { usersSchema } from "@/lib/mock/schema"
import { QueryNodeRenderer } from "@/components/query-builder/QueryNodeRenderer"
import { LivePreview } from "@/components/preview/LivePreview"
import { ResultsPanel } from "@/components/results/ResultsPanel"
import { useMobileTab } from "@/lib/mobileTabContext"
import { cn } from "@/lib/utils"
import { TOGGLE_JSON_VIEW_EVENT, RUN_QUERY_EVENT } from "@/lib/constants"
import { dispatchRunQuery } from "@/lib/events"
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
    reorderChildren,
    setSelectedNodeId,
    exportTree,
  } = useQueryStore()

  const [jsonView, setJsonView] = useState(false)

  // Set default schema on mount
  useEffect(() => {
    setSchema(usersSchema)
  }, [setSchema])

  // Listen for Ctrl+B to toggle JSON view
  useEffect(() => {
    const handler = () => setJsonView((v) => !v)
    window.addEventListener(TOGGLE_JSON_VIEW_EVENT, handler)
    return () => window.removeEventListener(TOGGLE_JSON_VIEW_EVENT, handler)
  }, [])

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
  const handleReorderChildren = useCallback(
    (parentGroupId: string, fromIndex: number, toIndex: number) =>
      reorderChildren(parentGroupId, fromIndex, toIndex),
    [reorderChildren]
  )

  const { activeTab, setActiveTab } = useMobileTab()

  const jsonTextRef = React.useRef<HTMLTextAreaElement>(null)

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">

      {/* Upper area: Center Panel & Right Panel */}
      <div className={cn(
        "flex flex-col lg:flex-row overflow-hidden min-h-0",
        activeTab === "preview" ? "hidden lg:flex lg:flex-1" : "flex flex-1"
      )}>

        {/* Center Panel */}
        <div className={cn(
          "flex-1 flex-col overflow-y-auto bg-background transition-colors duration-200 min-w-0",
          activeTab === "builder" ? "flex" : "hidden lg:flex"
        )}>

          {/* Canvas header */}
          <div className="flex justify-between items-center px-container-padding pt-6 pb-4 shrink-0">
            <h1 className="font-headline-md text-headline-md text-on-background">
              Query Rules
            </h1>
            <div className="flex items-center gap-2">
              {/* Builder / JSON toggle */}
              <div className="flex gap-2 bg-surface-container rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setJsonView(false)}
                  className={cn(
                    "px-3 py-1 rounded font-label-caps text-label-caps transition-colors cursor-pointer",
                    !jsonView
                      ? "bg-surface shadow-sm text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  Builder
                </button>
                <button
                  type="button"
                  onClick={() => setJsonView(true)}
                  className={cn(
                    "px-3 py-1 rounded font-label-caps text-label-caps transition-colors cursor-pointer",
                    jsonView
                      ? "bg-surface shadow-sm text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Root group card — click background to deselect */}
          <div
            className="px-container-padding pb-container-padding flex-1 min-w-0"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedNodeId(null)
            }}
          >
            {jsonView ? (
              /* JSON view — editable query tree */
              <div className="bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden min-h-full flex flex-col">
                <div className="p-3 border-b border-border bg-surface-bright flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-muted-foreground uppercase tracking-wider">
                    Edit Query Tree JSON
                  </span>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        const ta = jsonTextRef.current;
                        if (ta) {
                          try {
                            const parsed = JSON.parse(ta.value);
                            useQueryStore.getState().importTree(parsed);
                          } catch (err) {
                            alert("Invalid JSON");
                          }
                        }
                      }}
                      className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const json = JSON.stringify(exportTree(), null, 2)
                        navigator.clipboard.writeText(json).then(() => {}).catch(() => {})
                        if (jsonTextRef.current) {
                          jsonTextRef.current.value = json;
                        }
                      }}
                      className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <textarea 
                  ref={jsonTextRef}
                  className="flex-1 p-4 font-code-sm text-code-sm text-on-surface bg-surface-dim leading-relaxed w-full outline-none resize-none no-scrollbar"
                  defaultValue={JSON.stringify(queryTree, null, 2)}
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm min-h-full overflow-auto no-scrollbar relative">
                {schema ? (
                  <div className="min-w-max pb-20 lg:pb-0">
                    <QueryNodeRenderer
                      node={queryTree}
                      schema={schema}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                      onAddRule={handleAddRule}
                      onAddGroup={handleAddGroup}
                      onSetLogicalOperator={handleSetLogicalOperator}
                      onReorderChildren={handleReorderChildren}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-body-sm">
                    Loading schema…
                  </div>
                )}
                {/* Mobile Floating Action Button to Run Query */}
                <button
                  type="button"
                  onClick={() => {
                    dispatchRunQuery()
                    setActiveTab("results")
                  }}
                  className="lg:hidden fixed bottom-20 right-4 rounded-full size-12 bg-primary text-primary-foreground shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary-container hover:text-on-primary-container z-50 animate-slide-down-fade"
                  aria-label="Run Query"
                >
                  <Play className="size-5 fill-current" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={cn(
          activeTab === "results" ? "flex flex-1 min-w-0 lg:flex-none lg:w-[400px]" : "hidden lg:flex lg:w-[400px]"
        )}>
          <ResultsPanel />
        </div>

      </div>

      {/* Bottom Dock */}
      <div className={cn(
        activeTab === "preview"
          ? "flex flex-1 flex-col lg:flex-none lg:h-48"
          : "hidden lg:flex lg:flex-col"
      )}>
        <LivePreview />
      </div>

    </div>
  )
}
