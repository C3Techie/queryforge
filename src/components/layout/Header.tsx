"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sun, Moon, Command, Upload, Download } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"

export function Header() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )

  const toggleDarkMode = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface dark:bg-surface-dim border-b border-border shadow-sm flex justify-between items-center px-4 md:px-6 z-50 transition-colors duration-200">
      
      {/* Left Side: Brand and Mobile Navigation */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger Drawer */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest cursor-pointer h-9 w-9 rounded-full"
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

        {/* Logo / Brand Title */}
        <span className="font-display text-display font-black text-primary dark:text-primary-fixed-dim tracking-tight select-none text-lg md:text-xl">
          QueryForge
        </span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Import Action */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest px-3 py-1.5 h-8 gap-1.5"
        >
          <Upload className="size-3.5" />
          <span>Import</span>
        </Button>

        {/* Export Action */}
        <Button
          variant="default"
          size="sm"
          className="font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-primary-container hover:text-on-primary-container px-3 py-1.5 h-8 gap-1.5"
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

        {/* Keyboard Hint Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest h-8 w-8 rounded cursor-pointer"
          aria-label="Keyboard shortcuts"
        >
          <Command className="size-4.5" />
        </Button>
      </div>

    </header>
  )
}
