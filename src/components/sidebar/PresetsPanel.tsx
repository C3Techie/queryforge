"use client"

import * as React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Bookmark, Play, Trash2 } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { Input } from "@/components/ui/input"
import { OPEN_PRESETS_EVENT } from "@/lib/constants"
import { cn } from "@/lib/utils"


interface PresetsPanelProps {
  focusInput?: boolean
}

export function PresetsPanel({ focusInput = false }: PresetsPanelProps) {
  const { presets, savePreset, loadPreset, deletePreset } = useQueryStore()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusInput) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [focusInput])

  useEffect(() => {
    const handler = (e: Event) => {
      const isFocusSignal = (e as CustomEvent).detail?.focus === true
      if (isFocusSignal) {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener(OPEN_PRESETS_EVENT, handler)
    return () => window.removeEventListener(OPEN_PRESETS_EVENT, handler)
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Enter a name for this preset.")
      return
    }
    const duplicate = presets.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      setError(`A preset named "${trimmed}" already exists.`)
      return
    }
    savePreset(trimmed)
    setName("")
    setError(null)
  }, [name, presets, savePreset])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSave()
      if (e.key === "Escape") { setName(""); setError(null) }
    },
    [handleSave]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <span className="font-label-caps text-label-caps text-on-surface font-bold uppercase tracking-wider">
          Saved Presets
        </span>
      </div>

      {/* Save form */}
      <div className="px-3 py-3 border-b border-border shrink-0 flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            placeholder="Preset name…"
            className="h-8 flex-1 text-body-sm"
            aria-label="Preset name"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className={cn(
              "shrink-0 px-3 h-8 rounded font-label-caps text-label-caps transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary-container hover:text-on-primary-container",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            Save
          </button>
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      {/* Presets list */}
      <div className="flex-1 overflow-y-auto py-2">
        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center gap-2">
            <Bookmark className="size-8 text-muted-foreground opacity-40" />
            <p className="font-body-sm text-body-sm text-muted-foreground leading-relaxed">
              No saved presets. Build a query and save it for later.
            </p>
          </div>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5",
                "hover:bg-surface-container-high dark:hover:bg-surface-container-highest",
                "transition-colors group"
              )}
            >
              <Bookmark className="size-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-body-sm text-body-sm text-on-surface truncate font-medium">
                  {preset.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {preset.schemaName ?? 'Query'}
                  {' · '}
                  {preset.tree.children.length} condition{preset.tree.children.length !== 1 ? 's' : ''}
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => loadPreset(preset.id)}
                  className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-surface-container transition-colors"
                  aria-label={`Load preset ${preset.name}`}
                  title="Load"
                >
                  <Play className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deletePreset(preset.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-surface-container transition-colors"
                  aria-label={`Delete preset ${preset.name}`}
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
