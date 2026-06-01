"use client"

import * as React from "react"
import { useCallback } from "react"
import { History, RotateCcw, Trash2 } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { cn } from "@/lib/utils"


function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}


export function HistoryPanel() {
  const { queryHistory, restoreFromHistory, clearHistory } = useQueryStore()

  const handleRestore = useCallback(
    (id: string) => restoreFromHistory(id),
    [restoreFromHistory]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="font-label-caps text-label-caps text-on-surface font-bold uppercase tracking-wider">
          Query History
        </span>
        {queryHistory.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
            aria-label="Clear history"
          >
            <Trash2 className="size-3" />
            Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {queryHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center gap-2">
            <History className="size-8 text-muted-foreground opacity-40" />
            <p className="font-body-sm text-body-sm text-muted-foreground leading-relaxed">
              No query history yet. Run a query to see it here.
            </p>
          </div>
        ) : (
          queryHistory.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleRestore(entry.id)}
              className={cn(
                "w-full flex items-start gap-2.5 px-3 py-2.5 text-left",
                "hover:bg-surface-container-high dark:hover:bg-surface-container-highest",
                "transition-colors cursor-pointer group"
              )}
            >
              <History className="size-3.5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    {entry.schemaName ?? 'Query'}
                  </span>
                  <span className="font-body-sm text-body-sm text-muted-foreground shrink-0 text-[11px]">
                    {relativeTime(entry.timestamp)}
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-muted-foreground">
                  {entry.tree.children.length} condition{entry.tree.children.length !== 1 ? 's' : ''}
                  {' · '}{entry.tree.logicalOperator}
                </span>
              </div>
              <RotateCcw className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
