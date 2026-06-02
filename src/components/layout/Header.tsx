"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sun, Moon, Command, Upload, Download } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { ShortcutsModal } from "@/components/shortcuts/ShortcutsModal"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useQueryStore } from "@/store/queryStore"
import { useToast } from "@/components/ui/toast"
import { TOGGLE_DARK_MODE_EVENT, TRIGGER_IMPORT_EVENT } from "@/lib/constants"
import { parseImportedTree } from "@/lib/querySafety"

export function Header() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const { exportTree, importTree } = useQueryStore()
  const { toast } = useToast()

  const applyDark = useCallback((nextDark: boolean) => {
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = useCallback(() => {
    applyDark(!isDark)
  }, [isDark, applyDark])

  const toggleShortcutsModal = useCallback(() => {
    setShortcutsOpen((v) => !v)
  }, [])

  // Export: serialize tree to JSON and trigger download
  const handleExport = useCallback(() => {
    const tree = exportTree()
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `queryforge-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportTree])

  // Import: open file picker
  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string)
          const validatedTree = parseImportedTree(parsed)
          if (!validatedTree.success) {
            toast(validatedTree.error, 'error')
            return
          }
          importTree(validatedTree.data)
          toast('Query imported successfully.', 'success')
        } catch {
          toast('Could not parse file — invalid JSON.', 'error')
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [importTree, toast]
  )

  useEffect(() => {
    const handler = () => toggleDarkMode()
    window.addEventListener(TOGGLE_DARK_MODE_EVENT, handler)
    return () => window.removeEventListener(TOGGLE_DARK_MODE_EVENT, handler)
  }, [toggleDarkMode])

  // Ctrl+I triggers the file import picker
  useEffect(() => {
    const handler = () => handleImportClick()
    window.addEventListener(TRIGGER_IMPORT_EVENT, handler)
    return () => window.removeEventListener(TRIGGER_IMPORT_EVENT, handler)
  }, [handleImportClick])

  useKeyboardShortcuts({ onToggleShortcutsModal: toggleShortcutsModal })

  return (
    <>
      {/* Hidden file input for import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
        aria-hidden="true"
      />

      <header className="fixed top-0 left-0 right-0 h-14 bg-surface dark:bg-surface-dim border-b border-border shadow-sm flex justify-between items-center px-4 md:px-6 z-50 transition-colors duration-200">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer h-9 w-9 rounded-full"
                  aria-label="Open Sidebar Menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] bg-surface-container-low dark:bg-surface-container-lowest border-r border-border h-full flex flex-col" showCloseButton={true}>
              <Sidebar isMobileDrawer={true} />
            </SheetContent>
          </Sheet>

          {/* Logo — click to refresh page, on mobile also resets to builder tab */}
          <Link
            href="/"
            className="font-display text-display font-black text-primary dark:text-primary-fixed-dim tracking-tight select-none text-lg lg:text-xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            QueryForge
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleImportClick}
            title="Import query from JSON file"
            aria-label="Import query"
            className="flex sm:hidden text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest h-8 w-8 rounded"
          >
            <Upload className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImportClick}
            title="Import query from JSON file"
            className="hidden sm:flex font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest px-3 py-1.5 h-8 gap-1.5"
          >
            <Upload className="size-3.5" />
            <span>Import</span>
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handleExport}
            title="Export query as JSON file"
            aria-label="Export query"
            className="flex sm:hidden font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-primary-container hover:text-on-primary-container h-8 w-8 rounded"
          >
            <Download className="size-3.5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            title="Export query as JSON file"
            className="hidden sm:flex font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-primary-container hover:text-on-primary-container px-3 py-1.5 h-8 gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>

          {/* Theme Toggler */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="group text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest h-8 w-8 rounded cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="size-4.5 transition-transform duration-500 hover:rotate-180 text-amber-500" />
            ) : (
              <Moon className="size-4.5 transition-transform duration-500 hover:rotate-180 text-blue-500" />
            )}
          </Button>

          {/* Keyboard Shortcuts */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShortcutsModal}
            className="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest h-8 w-8 rounded cursor-pointer"
            aria-label="Keyboard shortcuts (?)"
            title="Keyboard shortcuts (?)"
          >
            <Command className="size-4.5" />
          </Button>
        </div>
      </header>

      <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
