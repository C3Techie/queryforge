"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Database, Bookmark, History, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isMobileDrawer?: boolean
}

export function Sidebar({ className, isMobileDrawer = false, ...props }: SidebarProps) {
  const [isSchemaExpanded, setIsSchemaExpanded] = useState(true)
  const [activeItem, setActiveItem] = useState<"users" | "products" | "presets" | "history">("users")

  return (
    <aside
      className={cn(
        "w-full h-full flex flex-col gap-4 p-4 shrink-0 transition-colors duration-200",
        !isMobileDrawer && "w-[260px] bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline shadow-sm",
        className
      )}
      {...props}
    >
      {/* Top Header Section */}
      <div className="p-2">
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">
          Explorer
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mt-0.5">
          Data Workspace
        </p>
      </div>

      {/* Action Button */}
      <div className="pb-3 border-b border-outline-variant">
        <Button
          variant="default"
          className="w-full bg-primary text-primary-foreground py-2 rounded font-label-caps text-label-caps shadow-sm hover:opacity-95 hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="size-4" />
          <span>New Query</span>
        </Button>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        
        {/* Schema Active Top Item */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
            className="w-full flex items-center justify-between p-2 bg-secondary-container dark:bg-secondary-fixed-dim text-on-secondary-container dark:text-on-secondary-fixed font-bold rounded-lg transition-all duration-200 hover:pl-3 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Database className="size-4 text-on-secondary-container dark:text-on-secondary-fixed fill-current" />
              <span className="font-label-caps text-label-caps">Schema</span>
            </div>
            {isSchemaExpanded ? (
              <ChevronUp className="size-3.5 opacity-60" />
            ) : (
              <ChevronDown className="size-3.5 opacity-60" />
            )}
          </button>

          {/* Sub-items list */}
          {isSchemaExpanded && (
            <div className="ml-9 flex flex-col gap-1.5 py-1 mb-2">
              <button
                onClick={() => setActiveItem("users")}
                className={cn(
                  "font-body-sm text-body-sm py-1 hover:text-primary transition-colors flex items-center gap-2 text-left cursor-pointer",
                  activeItem === "users" ? "text-primary font-bold" : "text-on-surface"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-transform duration-200",
                  activeItem === "users" ? "bg-primary scale-110" : "bg-outline-variant"
                )} />
                <span>Users</span>
              </button>

              <button
                onClick={() => setActiveItem("products")}
                className={cn(
                  "font-body-sm text-body-sm py-1 hover:text-primary transition-colors flex items-center gap-2 text-left cursor-pointer",
                  activeItem === "products" ? "text-primary font-bold" : "text-on-surface-variant"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-transform duration-200",
                  activeItem === "products" ? "bg-primary scale-110" : "bg-outline-variant"
                )} />
                <span>Products</span>
              </button>
            </div>
          )}
        </div>

        {/* Presets Item */}
        <button
          onClick={() => setActiveItem("presets")}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:pl-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer text-left",
            activeItem === "presets"
              ? "text-primary font-bold bg-surface-container dark:bg-surface-container-high"
              : "text-on-surface-variant dark:text-surface-variant hover:text-on-surface"
          )}
        >
          <Bookmark className="size-4" />
          <span className="font-label-caps text-label-caps">Presets</span>
        </button>

        {/* History Item */}
        <button
          onClick={() => setActiveItem("history")}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:pl-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer text-left",
            activeItem === "history"
              ? "text-primary font-bold bg-surface-container dark:bg-surface-container-high"
              : "text-on-surface-variant dark:text-surface-variant hover:text-on-surface"
          )}
        >
          <History className="size-4" />
          <span className="font-label-caps text-label-caps">History</span>
        </button>

      </nav>
    </aside>
  )
}
