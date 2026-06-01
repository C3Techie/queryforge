"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { ChevronRight, PlusCircle, FolderPlus, Trash2, Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QueryNodeRenderer } from "./QueryNodeRenderer"
import { SortableItem } from "./SortableItem"
import { useQueryStore } from "@/store/queryStore"
import type { Rule, RuleGroup, Schema } from "@/types/query"
import { cn } from "@/lib/utils"


interface GroupContainerProps {
  group: RuleGroup
  schema: Schema
  isRoot?: boolean
  dragHandle?: React.ReactNode
  onUpdate: (id: string, updates: Partial<Rule | RuleGroup>) => void
  onRemove: (id: string) => void
  onAddRule: (parentGroupId: string) => void
  onAddGroup: (parentGroupId: string) => void
  onSetLogicalOperator: (groupId: string, op: "AND" | "OR") => void
  onReorderChildren: (parentGroupId: string, fromIndex: number, toIndex: number) => void
}

// GroupContainer
function GroupContainerInner({
  group,
  schema,
  isRoot = false,
  dragHandle,
  onUpdate,
  onRemove,
  onAddRule,
  onAddGroup,
  onSetLogicalOperator,
  onReorderChildren,
}: GroupContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { selectedNodeId, setSelectedNodeId } = useQueryStore()
  const isSelected = selectedNodeId === group.id

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleAddRule = useCallback(() => onAddRule(group.id), [group.id, onAddRule])
  const handleAddGroup = useCallback(() => onAddGroup(group.id), [group.id, onAddGroup])
  const handleRemove = useCallback(() => onRemove(group.id), [group.id, onRemove])
  const handleLogicalOperator = useCallback(
    (op: string | null) => {
      if (!op) return
      onSetLogicalOperator(group.id, op as "AND" | "OR")
    },
    [group.id, onSetLogicalOperator]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const ids = group.children.map((c) => c.id)
      const fromIndex = ids.indexOf(String(active.id))
      const toIndex = ids.indexOf(String(over.id))
      if (fromIndex === -1 || toIndex === -1) return

      arrayMove(group.children, fromIndex, toIndex)
      onReorderChildren(group.id, fromIndex, toIndex)
    },
    [group.id, group.children, onReorderChildren]
  )

  // Find the node being dragged for the DragOverlay
  const activeNode = activeId
    ? group.children.find((c) => c.id === activeId) ?? null
    : null

  const childIds = group.children.map((c) => c.id)

  return (
    <div
      className={cn(
        "rule-group relative",
        !isRoot && "border-l-2 border-primary pl-4 py-2 mt-2"
      )}
    >
      {/* Group header */}
      <div
        onClick={() => setSelectedNodeId(group.id)}
        className={cn(
          "flex items-center flex-wrap gap-2 mb-3 z-10 relative bg-background w-max pr-2 rounded cursor-pointer",
          isSelected && "ring-2 ring-primary ring-offset-1"
        )}
      >
        {/* External drag handle */}
        {dragHandle}

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
        <Select value={group.logicalOperator} onValueChange={handleLogicalOperator}>
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
          <div className="border border-dashed border-border rounded p-4 text-center text-muted-foreground text-body-sm">
            Add a condition or nested group
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
              {group.children.map((child) => (
                <SortableItem key={child.id} id={child.id}>
                  {(handle) => (
                    <QueryNodeRenderer
                      node={child}
                      schema={schema}
                      dragHandle={handle}
                      onUpdate={onUpdate}
                      onRemove={onRemove}
                      onAddRule={onAddRule}
                      onAddGroup={onAddGroup}
                      onSetLogicalOperator={onSetLogicalOperator}
                      onReorderChildren={onReorderChildren}
                    />
                  )}
                </SortableItem>
              ))}
            </SortableContext>

            {/* DragOverlay */}
            <DragOverlay>
              {activeNode ? (
                <div className="shadow-lg rounded opacity-95 bg-surface border border-primary">
                  <QueryNodeRenderer
                    node={activeNode}
                    schema={schema}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                    onAddRule={onAddRule}
                    onAddGroup={onAddGroup}
                    onSetLogicalOperator={onSetLogicalOperator}
                    onReorderChildren={onReorderChildren}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
