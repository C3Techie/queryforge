"use client"

import { useState, useEffect } from "react"
import { useQueryStore } from "@/store/queryStore"
import { schemas } from "@/lib/mock/schema"
import { formatFieldLabel, fieldTypeBadgeClass } from "@/lib/schemaDisplay"
import type { FieldType } from "@/types/query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

function FieldTypeBadge({ type }: { type: FieldType }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        fieldTypeBadgeClass(type)
      )}
    >
      {type}
    </span>
  )
}

function FieldRow({ name, type }: { name: string; type: FieldType }) {
  return (
    <span className="flex w-full items-center justify-between gap-2 min-w-0">
      <span className="truncate font-medium text-foreground">
        {formatFieldLabel(name)}
      </span>
      <FieldTypeBadge type={type} />
    </span>
  )
}

export function SchemaExplorer() {
  const { schema: activeSchema, setSchema } = useQueryStore()
  const [highlightedField, setHighlightedField] = useState<string | null>(null)

  useEffect(() => {
    setHighlightedField(null)
  }, [activeSchema?.name])

  const columnCount = activeSchema?.fields.length ?? 0

  return (
    <div className="flex flex-col gap-3 px-2 pb-2 w-full min-w-0">
      <div className="flex flex-col gap-1.5 min-w-0">
        <label
          htmlFor="schema-table-select"
          className="font-label-caps text-[10px] uppercase tracking-wider text-muted-foreground px-0.5"
        >
          Table
        </label>
        <Select
          value={activeSchema?.name ?? ""}
          onValueChange={(name) => {
            if (!name) return
            const next = schemas.find((s) => s.name === name)
            if (next) setSchema(next)
          }}
        >
          <SelectTrigger
            id="schema-table-select"
            size="default"
            className="w-full min-h-9 touch-manipulation"
          >
            <SelectValue placeholder="Select table…" />
          </SelectTrigger>
          <SelectContent className="max-h-[min(16rem,50vh)]">
            {schemas.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        <label
          htmlFor="schema-columns-select"
          className="font-label-caps text-[10px] uppercase tracking-wider text-muted-foreground px-0.5"
        >
          Columns
        </label>
        <Select
          value={highlightedField ?? ""}
          onValueChange={(fieldName) => setHighlightedField(fieldName || null)}
          disabled={!activeSchema}
        >
          <SelectTrigger
            id="schema-columns-select"
            size="default"
            className="w-full min-h-9 touch-manipulation disabled:opacity-50"
          >
            <SelectValue
              placeholder={
                activeSchema
                  ? `${columnCount} column${columnCount === 1 ? "" : "s"}`
                  : "Select a table first"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-[min(18rem,55vh)] w-(--anchor-width)">
            {activeSchema?.fields.map((field) => (
              <SelectItem key={field.name} value={field.name}>
                <FieldRow name={field.name} type={field.type} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
