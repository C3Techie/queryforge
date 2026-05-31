"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { ChevronRight, PlusCircle, FolderPlus, Trash2, Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QueryNodeRenderer } from "./QueryNodeRenderer"
import type { Rule, RuleGroup, Schema } from "@/types/query"
import { cn } from "@/lib/utils"

interface GroupContainerProps {
  group: RuleGroup
  schema: Schema
  isRoot?: boolean
  onUpdate: (id: string, updates: Partial<Rule | RuleGroup>) => void
  onRemove: (id: string) => void
  onAddRule: (parentGroupId: string) => void
  onAddGroup: (parentGroupId: string) => void
  onSetLogicalOperator: (groupId: string, op: "AND" | "OR") => void
}


function GroupContainerInner({
  group,
  schema,
  isRoot = false,
  onUpdate,
  onRemove,
  onAddRule,
  onAddGroup,
  onSetLogicalOperator,
}: GroupContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleAddRule = useCallback(
    () => onAddRule(group.id),
    [group.id, onAddRule]
  )
  const handleAddGroup = useCallback(
    () => onAddGroup(group.id),
    [group.id, onAddGroup]
  )
  const handleRemove = useCallback(
    () => onRemove(group.id),
    [group.id, onRemove]
  )
  const handleLogicalOperator = useCallback(
    (op: string | null) => {
      if (!op) return
      onSetLogicalOperator(group.id, op as "AND" | "OR")
    },
    [group.id, onSetLogicalOperator]
  )

  return (
    <div
      className={cn(
        "rule-group relative",
        !isRoot && "border-l-2 border-primary pl-4 py-2 mt-2"
      )}
    >
      {/* Group header */}
      <div className="flex items-center gap-2 mb-3 z-10 relative bg-background w-max pr-2">
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="p-0.5 rounded text-muted-foreground hover:text-on-surface transition-colors"
          aria-label={isCollapsed ? "Expand group" : "Collapse group"}
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-300",
              !isCollapsed && "rotate-90"
            )}
          />
        </button>

        {/* AND / OR toggle */}
        <Select
          value={group.logicalOperator}
          onValueChange={handleLogicalOperator}
        >
          <SelectTrigger className="h-7 w-20 bg-secondary-container text-on-secondary-container border-0 rounded font-label-caps text-label-caps py-1 pl-2 pr-6 focus-visible:ring-2 focus-visible:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>

        {/* Add rule */}
        <button
          type="button"
          onClick={handleAddRule}
          className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
          aria-label="Add rule"
        >
          <PlusCircle className="size-4" />
        </button>

        {/* Add nested group */}
        <button
          type="button"
          onClick={handleAddGroup}
          className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
          aria-label="Add nested group"
        >
          <FolderPlus className="size-4" />
        </button>

        {/* Delete group */}
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete group"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Children container — animated collapse */}
      <div
        className={cn(
          "pl-6 flex flex-col gap-3 relative z-10 overflow-hidden transition-all duration-300",
          isCollapsed
            ? "max-h-0 opacity-0 pointer-events-none"
            : "max-h-[2000px] opacity-100"
        )}
      >
        {group.children.length === 0 ? (
          /* Empty state */
          <div className="border border-dashed border-border rounded p-4 text-center text-muted-foreground text-body-sm">
            Add a condition or nested group
          </div>
        ) : (
          group.children.map((child) => (
            <QueryNodeRenderer
              key={child.id}
              node={child}
              schema={schema}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddRule={onAddRule}
              onAddGroup={onAddGroup}
              onSetLogicalOperator={onSetLogicalOperator}
            />
          ))
        )}

        {/* Add rule footer */}
        <div className="mt-1 pt-3 border-t border-border flex justify-center">
          <button
            type="button"
            onClick={handleAddRule}
            className="text-primary hover:text-primary-container font-label-caps text-label-caps flex items-center gap-1 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Rule
          </button>
        </div>
      </div>
    </div>
  )
}

export const GroupContainer = React.memo(GroupContainerInner)
