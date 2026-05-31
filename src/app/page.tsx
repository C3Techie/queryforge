"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sun, Moon, Info, Trash, Plus, Terminal, TableProperties } from "lucide-react"

export default function Home() {
  const [isDark, setIsDark] = useState(false)

  // Sync dark class on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background py-12 px-4 transition-colors duration-300">
      <main className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header / Brand Panel */}
        <header className="bg-surface flex justify-between items-center h-16 px-6 border border-outline-variant rounded-lg shadow-sm">
          <div className="flex flex-col">
            <span className="font-display text-display font-black text-primary dark:text-primary tracking-tight">
              QueryBuilder Pro
            </span>
            <span className="font-body-sm text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
              Stitch Design System Foundation
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="flex items-center gap-2 h-8 px-3 border border-outline-variant"
          >
            {isDark ? (
              <>
                <Sun className="size-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="size-3.5 text-blue-500" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </header>

        {/* Introduction Banner */}
        <div className="bg-secondary-container text-on-secondary-container border border-outline-variant p-4 rounded-lg flex gap-3 items-start shadow-sm">
          <Info className="size-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="font-headline-sm text-sm font-bold">
              Design System Alignment Verified
            </h4>
            <p className="font-body-sm text-[12px] leading-relaxed opacity-90">
              This preview page maps the exact CSS classes and color tokens used in <code>sample.md</code> (such as <code>bg-surface</code>, <code>bg-surface-bright</code>, <code>bg-surface-dim</code>, <code>bg-secondary-container</code>, and <code>border-outline-variant</code>).
            </p>
          </div>
        </div>

        {/* Responsive Flex Containers Stack */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* Card: Nested Rule Group and Connector Tree Lines */}
          <Card className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
            <CardHeader className="p-0 pb-4 border-b border-outline-variant mb-4">
              <CardTitle className="font-headline-sm text-headline-sm font-semibold text-primary">
                Functional Nesting & Tree Lines (Accents)
              </CardTitle>
              <CardDescription className="font-body-sm text-body-sm text-on-surface-variant">
                Tree line selector connectors styled in <code>globals.css</code> matching the animated prototype.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Mock Rule Group Container */}
              <div className="flex flex-col rule-group">
                
                {/* Group Header (AND) */}
                <div className="flex items-center gap-3 mb-4 z-10 bg-surface-container-lowest border border-outline-variant w-max px-2.5 py-1 rounded">
                  <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-2.5 py-0.5 rounded font-black tracking-wider uppercase">AND</span>
                  <span className="font-body-sm text-[11px] font-bold text-on-surface-variant tracking-wide">Match all criteria</span>
                </div>

                <div className="pl-6 flex flex-col gap-4 relative z-10">
                  {/* Rule Row 1 */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-surface-bright border border-outline-variant rounded p-3 hover:bg-surface-container-high transition-colors duration-200 w-full shadow-sm">
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-bold md:w-32">name</span>
                    <span className="text-[10px] text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded font-black tracking-widest uppercase">string</span>
                    <span className="font-body-sm text-body-sm text-on-surface md:w-32">contains</span>
                    <Input className="flex-1 max-w-md h-8 border border-outline-variant" type="text" value="John" readOnly />
                    <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-error self-end md:self-auto hover:bg-surface-container-highest">
                      <Trash className="size-4" />
                    </Button>
                  </div>

                  {/* Nested Group (OR) */}
                  <div className="border-l-2 border-primary pl-4 py-2 mt-2 rule-group relative">
                    
                    {/* Nested Header */}
                    <div className="flex items-center gap-3 mb-4 z-10 bg-surface-container-lowest border border-outline-variant w-max px-2.5 py-1 rounded">
                      <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-2.5 py-0.5 rounded font-black tracking-wider uppercase">OR</span>
                    </div>

                    <div className="pl-6 flex flex-col gap-4 relative z-10">
                      
                      {/* Nested Rule A */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-surface-bright border border-outline-variant rounded p-3 hover:bg-surface-container-high transition-colors duration-200 w-full shadow-sm">
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-bold md:w-32">age</span>
                        <span className="text-[10px] text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded font-black tracking-widest uppercase">number</span>
                        <span className="font-body-sm text-body-sm text-on-surface md:w-32">&gt;</span>
                        <Input className="flex-1 max-w-md h-8 border border-outline-variant" type="number" value="25" readOnly />
                        <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-error self-end md:self-auto hover:bg-surface-container-highest">
                          <Trash className="size-4" />
                        </Button>
                      </div>

                      {/* Nested Rule B */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-surface-bright border border-outline-variant rounded p-3 hover:bg-surface-container-high transition-colors duration-200 w-full shadow-sm">
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-bold md:w-32">status</span>
                        <span className="text-[10px] text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded font-black tracking-widest uppercase">enum</span>
                        <span className="font-body-sm text-body-sm text-on-surface md:w-32">is</span>
                        
                        <Select defaultValue="active">
                          <SelectTrigger className="flex-1 max-w-md h-8 border border-outline-variant bg-surface-container-lowest text-on-surface">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-error self-end md:self-auto hover:bg-surface-container-highest">
                          <Trash className="size-4" />
                        </Button>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant flex justify-center gap-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 border border-outline-variant">
                    <Plus className="size-4" />
                    <span>Add Rule</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-error hover:bg-error/10 border border-outline-variant">
                    <Trash className="size-4" />
                    <span>Delete Group</span>
                  </Button>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Cards Flex Container (Row on md, Col on mobile) */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            
            {/* Card: Inputs & Controls */}
            <Card className="flex-1 bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
              <CardHeader className="p-0 pb-4 border-b border-outline-variant mb-4">
                <CardTitle className="font-headline-sm text-headline-sm font-semibold">Form Inputs & Controls</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-black">Text Input</label>
                  <Input type="text" className="border border-outline-variant" placeholder="Enter query string..." />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-black">Dropdown Selection</label>
                  <Select defaultValue="active">
                    <SelectTrigger className="w-full border border-outline-variant bg-surface-container-lowest text-on-surface">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-black">Disabled Controls</label>
                  <Input type="text" className="border border-outline-variant" placeholder="Disabled placeholder..." disabled />
                </div>
              </CardContent>
            </Card>

            {/* Card: Buttons & Badges */}
            <Card className="flex-1 bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
              <CardHeader className="p-0 pb-4 border-b border-outline-variant mb-4">
                <CardTitle className="font-headline-sm text-headline-sm font-semibold">Buttons & Badges</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-6">
                
                {/* Buttons showcase */}
                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-black">Button Variants</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="default">Primary</Button>
                    <Button variant="outline" className="border border-outline-variant">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                {/* Status Pills Showcase */}
                <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-black">Status Badges (Pills)</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline" className="border border-outline-variant bg-surface-container-lowest">Outline</Badge>
                  </div>
                </div>

                {/* Description of hover */}
                <div className="border-t border-outline-variant pt-4 text-on-surface-variant">
                  <p className="font-body-sm text-[12px] leading-relaxed">
                    Default border radius matches Stitch defaults (0.25rem for buttons and inputs). Primary buttons hover transitions cleanly to <code>bg-primary-container</code>.
                  </p>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Card: Syntax Preview */}
          <Card className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
            <CardHeader className="p-0 pb-4 border-b border-outline-variant mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline-sm text-headline-sm font-semibold flex items-center gap-2">
                  <Terminal className="size-4.5 text-primary" />
                  <span>Syntax Preview</span>
                </CardTitle>
                <CardDescription className="font-body-sm text-body-sm text-on-surface-variant">
                  JetBrains Mono code styling with subtle 1px border cards
                </CardDescription>
              </div>
              <div className="flex gap-2 bg-surface-container p-1 rounded-md">
                <Badge variant="default" className="text-[9px]">SQL</Badge>
                <Badge variant="outline" className="text-[9px] bg-transparent border-0 text-on-surface-variant hover:text-on-surface">JSON</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-surface-dim p-4 rounded border border-outline-variant relative overflow-hidden group">
                <div className="absolute inset-0 pointer-events-none code-shimmer opacity-20 group-hover:opacity-30 animate-shimmer transition-opacity duration-500"></div>
                <pre className="font-code-md text-code-md text-on-surface leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-primary font-bold">SELECT</span> * <span className="text-primary font-bold">FROM</span> Users <span className="text-primary font-bold">WHERE</span> name <span className="text-primary font-bold">LIKE</span> <span className="text-tertiary-container dark:text-tertiary-fixed font-semibold">'%John%'</span> <span className="text-primary font-bold">AND</span> age &gt; <span className="text-secondary font-bold">25</span>;
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Card: Results Table */}
          <Card className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm">
            <CardHeader className="p-0 pb-4 border-b border-outline-variant mb-4">
              <CardTitle className="font-headline-sm text-headline-sm font-semibold flex items-center gap-2">
                <TableProperties className="size-4.5 text-primary" />
                <span>Mock Data Workspace</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest shadow-sm">
                <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant">
                    <tr>
                      <th className="p-3 font-bold text-on-surface">id</th>
                      <th className="p-3 font-bold text-on-surface">name</th>
                      <th className="p-3 font-bold text-on-surface">age</th>
                      <th className="p-3 font-bold text-on-surface">status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors duration-150">
                      <td className="p-3 font-code-sm text-code-sm text-on-surface-variant font-semibold">1042</td>
                      <td className="p-3 text-on-surface">John Doe</td>
                      <td className="p-3 text-on-surface">28</td>
                      <td className="p-3"><Badge>active</Badge></td>
                    </tr>
                    <tr className="hover:bg-surface-bright transition-colors duration-150">
                      <td className="p-3 font-code-sm text-code-sm text-on-surface-variant font-semibold">2199</td>
                      <td className="p-3 text-on-surface">Jane Smith</td>
                      <td className="p-3 text-on-surface">34</td>
                      <td className="p-3"><Badge>active</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-on-surface-variant text-xs font-body-sm border-t border-outline-variant pt-6 pb-12">
          &copy; 2026 QueryForge. Tailored exactly to the Stitch Design System foundation.
        </footer>

      </main>
    </div>
  )
}
