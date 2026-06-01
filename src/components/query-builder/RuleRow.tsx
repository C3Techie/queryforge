"use client"

import * as React from "react"
import { useMemo, useCallback } from "react"
import { GripVertical, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OPERATOR_MAP, OPERATOR_LABELS } from "@/lib/constants"
import { validateNode } from "@/lib/validation/validateNode"
import { useQueryStore } from "@/store/queryStore"
import type { Rule, Schema, Operator } from "@/types/query"
import { cn } from "@/lib/utils"

interface RuleRowProps {
  rule: Rule
  schema: Schema
  dragHandle?: React.ReactNode
  onUpdate: (id: string, updates: Partial<Rule>) => void
  onRemove: (id: string) => void
}


function ValueInput({
  rule,
  schema,
  onUpdate,
}: {
  rule: Rule
  schema: Schema
  onUpdate: (id: string, updates: Partial<Rule>) => void
}) {
  const schemaField = schema.fields.find((f) => f.name === rule.field)
  const noValue = rule.operator === "isNull" || rule.operator === "isNotNull"

  if (!schemaField || noValue) return null

  const value = rule.value as string

  // between: two inputs
  if (rule.operator === "between") {
    const parts = Array.isArray(rule.value)
      ? (rule.value as [string, string])
      : ["", ""]
    return (
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <Input
          type={schemaField.type === "date" ? "date" : "number"}
          value={parts[0] ?? ""}
          placeholder="from"
          className="flex-1 min-w-0 h-8"
          onChange={(e) =>
            onUpdate(rule.id, { value: [e.target.value, parts[1] ?? ""] })
          }
        />
        <span className="text-xs text-muted-foreground shrink-0">and</span>
        <Input
          type={schemaField.type === "date" ? "date" : "number"}
          value={parts[1] ?? ""}
          placeholder="to"
          className="flex-1 min-w-0 h-8"
          onChange={(e) =>
            onUpdate(rule.id, { value: [parts[0] ?? "", e.target.value] })
          }
        />
      </div>
    )
  }

  // inArray: comma-separated text
  if (rule.operator === "inArray") {
    return (
      <Input
        type="text"
        value={value}
        placeholder="value1, value2, ..."
        className="flex-1 min-w-0 h-8"
        onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
      />
    )
  }

  switch (schemaField.type) {
    case "string":
      return (
        <Input
          type="text"
          value={value}
          placeholder="Enter value…"
          className="flex-1 min-w-0 h-8"
          onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
        />
      )

    case "number":
      return (
        <Input
          type="number"
          value={value}
          placeholder="0"
          className="flex-1 min-w-0 h-8"
          onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
        />
      )

    case "date":
      return (
        <Input
          type="date"
          value={value}
          className="flex-1 min-w-0 h-8"
          onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
        />
      )

    case "boolean":
      return (
        <Select
          value={value || "true"}
          onValueChange={(v) => onUpdate(rule.id, { value: v })}
        >
          <SelectTrigger className="flex-1 min-w-0 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      )

    case "enum": {
      const options = schemaField.options ?? []
      return (
        <Select
          value={value}
          onValueChange={(v) => onUpdate(rule.id, { value: v })}
        >
          <SelectTrigger className="flex-1 min-w-0 h-8">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    case "array":
      return (
        <Input
          type="text"
          value={value}
          placeholder="Comma-separated values…"
          className="flex-1 min-w-0 h-8"
          onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
        />
      )

    default:
      return null
  }
}

function RuleRowInner({ rule, schema, dragHandle, onUpdate, onRemove }: RuleRowProps) {
  const { selectedNodeId, setSelectedNodeId } = useQueryStore()
  const isSelected = selectedNodeId === rule.id

  const errors = useMemo(
    () => (rule.field ? validateNode(rule, schema) : []),
    [rule, schema]
  )

  const hasErrors = errors.length > 0

  const schemaField = schema.fields.find((f) => f.name === rule.field)
  const allowedOperators = schemaField
    ? OPERATOR_MAP[schemaField.type]
    : (Object.keys(OPERATOR_LABELS) as Operator[])

  const handleFieldChange = useCallback(
    (field: string | null) => {
      if (!field) return
      const newSchemaField = schema.fields.find((f) => f.name === field)
      const newAllowed = newSchemaField ? OPERATOR_MAP[newSchemaField.type] : []
      const newOperator = newAllowed[0] ?? "equals"
      onUpdate(rule.id, { field, operator: newOperator, value: "" })
    },
    [rule.id, schema.fields, onUpdate]
  )

  const handleOperatorChange = useCallback(
    (operator: string | null) => {
      if (!operator) return
      onUpdate(rule.id, { operator: operator as Operator, value: "" })
    },
    [rule.id, onUpdate]
  )

  return (
    <div
      onClick={() => setSelectedNodeId(rule.id)}
      className={cn(
        "group animate-slide-down-fade",
        "flex flex-col gap-1",
        "bg-surface-bright border rounded p-2 transition-all duration-200",
        "hover:bg-surface-container-high hover:shadow-[0_-2px_0_0_theme(colors.primary)]",
        "cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-1",
        hasErrors ? "border-destructive" : "border-border"
      )}
    >
      {/* Controls row */}
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        {/* Drag handle — injected from SortableItem */}
        {dragHandle ?? (
          <GripVertical className="hidden md:block size-4 text-muted-foreground cursor-move shrink-0" />
        )}

        {/* Field selector */}
        <Select value={rule.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-full md:w-32 h-8 shrink-0">
            <SelectValue placeholder="Field…" />
          </SelectTrigger>
          <SelectContent>
            {schema.fields.map((f) => (
              <SelectItem key={f.name} value={f.name}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type badge */}
        {schemaField && (
          <span className="hidden md:inline text-xs text-muted-foreground shrink-0 w-14">
            {schemaField.type}
          </span>
        )}

        {/* Operator selector */}
        <Select value={rule.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger className="w-full md:w-36 h-8 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedOperators.map((op) => (
              <SelectItem key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value input */}
        <div className="flex-1 min-w-0">
          <ValueInput rule={rule} schema={schema} onUpdate={onUpdate} />
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onRemove(rule.id)}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-surface-container transition-colors"
          aria-label="Remove rule"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Validation errors */}
      {hasErrors && (
        <div className="flex flex-col gap-0.5 pl-6">
          {errors.map((err, i) => (
            <span key={i} className="text-xs text-destructive">
              {err}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export const RuleRow = React.memo(RuleRowInner)
