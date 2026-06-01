"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"


interface SortableItemProps {
  id: string
  children: (dragHandle: React.ReactNode) => React.ReactNode
}

// SortableItem
function SortableItemInner({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragHandle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label="Drag to reorder"
      className={cn(
        "hidden lg:flex items-center justify-center",
        "p-0.5 rounded text-muted-foreground cursor-grab active:cursor-grabbing",
        "hover:text-on-surface transition-colors shrink-0",
        "touch-none"
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-opacity",
        isDragging && "opacity-40"
      )}
    >
      {children(dragHandle)}
    </div>
  )
}

export const SortableItem = React.memo(SortableItemInner)
