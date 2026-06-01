"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Database, Bookmark, History, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { HistoryPanel } from "@/components/sidebar/HistoryPanel"
import { PresetsPanel } from "@/components/sidebar/PresetsPanel"
import { OPEN_PRESETS_EVENT } from "@/lib/constants"
import { useQueryStore } from "@/store/queryStore"
import { schemas } from "@/lib/mock/schema"
import { cn } from "@/lib/utils"


type SidebarView = "main" | "presets" | "history"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isMobileDrawer?: boolean
  /** When true, open the presets panel and focus the name input (Ctrl+S) */
  openPresetsWithFocus?: boolean
}

export function Sidebar({
  className,
  isMobileDrawer = false,
  openPresetsWithFocus = false,
  ...props
}: SidebarProps) {
  const [view, setView] = useState<SidebarView>(
    openPresetsWithFocus ? "presets" : "main"
  )
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true)
  const { schema: activeSchema, setSchema } = useQueryStore()

  useEffect(() => {
    const handler = (e: Event) => {
      const isFocusSignal = (e as CustomEvent).detail?.focus === true
      if (isFocusSignal) return

      setView("presets")
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(OPEN_PRESETS_EVENT, { detail: { focus: true } }))
      }, 100)
    }
    window.addEventListener(OPEN_PRESETS_EVENT, handler)
    return () => window.removeEventListener(OPEN_PRESETS_EVENT, handler)
  }, [])

  return (
    <aside
      className={cn(
        "w-full h-full flex flex-col shrink-0 transition-colors duration-200 overflow-hidden",
        !isMobileDrawer && "w-[260px] bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline shadow-sm hidden lg:flex",
        className
      )}
      {...props}
    >
      {/* ── Sub-panel views ─── */}
      {view !== "main" && (
        <>
          {/* Back button */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-on-surface transition-colors font-body-sm text-body-sm"
              aria-label="Back to main navigation"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {view === "history" && <HistoryPanel />}
            {view === "presets" && (
              <PresetsPanel focusInput={openPresetsWithFocus} />
            )}
          </div>
        </>
      )}

      {/* ── Main navigation view ─── */}
      {view === "main" && (
        <>
          {/* Header */}
          <div className="p-4 pb-2">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
              Explorer
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mt-0.5">
              Data Workspace
            </p>
          </div>

          {/* New Query button */}
          <div className="px-4 pb-3 border-b border-outline-variant">
            <Button
              variant="default"
              className="w-full bg-primary !text-on-primary py-2 rounded font-label-caps text-label-caps shadow-sm hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="size-4" />
              <span>New Query</span>
            </Button>
          </div>

          {/* Nav list */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto p-2">

            {/* Schema section */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsSchemaExpanded((v) => !v)}
                className="w-full flex items-center justify-between p-2 bg-secondary-container dark:bg-secondary-fixed-dim text-on-secondary-container dark:text-on-secondary-fixed font-bold rounded-lg transition-all duration-200 hover:pl-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Database className="size-4 fill-current" />
                  <span className="font-label-caps text-label-caps">Schema</span>
                </div>
                {isSchemaExpanded
                  ? <ChevronUp className="size-3.5 opacity-60" />
                  : <ChevronDown className="size-3.5 opacity-60" />
                }
              </button>

              {isSchemaExpanded && (
                <div className="ml-9 flex flex-col gap-1.5 py-1 mb-2">
                  {schemas.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSchema(s)}
                      className={cn(
                        "font-body-sm text-body-sm py-1 hover:text-primary transition-colors flex items-center gap-2 text-left cursor-pointer",
                        activeSchema?.name === s.name ? "text-primary font-bold" : "text-on-surface"
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full transition-transform duration-200",
                        activeSchema?.name === s.name ? "bg-primary scale-110" : "bg-outline-variant"
                      )} />
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Presets */}
            <button
              onClick={() => setView("presets")}
              className="w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:pl-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer text-left text-on-surface-variant dark:text-surface-variant hover:text-on-surface"
            >
              <Bookmark className="size-4" />
              <span className="font-label-caps text-label-caps">Presets</span>
            </button>

            {/* History */}
            <button
              onClick={() => setView("history")}
              className="w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:pl-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer text-left text-on-surface-variant dark:text-surface-variant hover:text-on-surface"
            >
              <History className="size-4" />
              <span className="font-label-caps text-label-caps">History</span>
            </button>

          </nav>
        </>
      )}
    </aside>
  )
}
