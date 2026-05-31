"use client"

import * as React from "react"
import { Database, Wrench, Eye, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      
      {/* Upper area: Center Panel & Right Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Center Panel (Query Builder Canvas) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-container-padding overflow-y-auto transition-colors duration-200">
          <div className="max-w-md text-center flex flex-col items-center gap-3 p-6 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-lg shadow-xs">
            <div className="p-3 bg-secondary-container dark:bg-secondary-fixed-dim rounded-full">
              <Wrench className="size-6 text-primary dark:text-primary-fixed-dim" />
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-on-background">
              Query Builder Canvas
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 leading-relaxed">
              Design and nest logical rules to construct robust queries dynamically. This workspace area will host the visual query builder controls.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary-container text-on-secondary-container font-label-caps uppercase tracking-wider">
              <Sparkles className="size-3" /> Coming Soon
            </span>
          </div>
        </div>

        {/* Right Panel (Query Results - Desktop only) */}
        <div className="hidden md:flex w-[320px] lg:w-[400px] border-l border-outline-variant dark:border-outline bg-surface dark:bg-surface-dim shrink-0 flex-col items-center justify-center p-6 text-center transition-colors duration-200">
          <div className="p-3 bg-surface-container-high dark:bg-surface-container-highest rounded-full mb-3">
            <Database className="size-6 text-primary dark:text-primary-fixed-dim" />
          </div>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1">
            Results Workspace
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-75 max-w-[280px] leading-relaxed">
            Run, profile, and audit matching records in real-time. Results and database records will populate this panel.
          </p>
        </div>

      </div>

      {/* Bottom Dock Panel (Live Preview - Desktop only) */}
      <div className="hidden md:flex h-48 border-t border-outline-variant dark:border-outline bg-surface-container-lowest dark:bg-surface-container-lowest shrink-0 items-center justify-center p-6 text-center transition-colors duration-200">
        <div className="max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-surface-container dark:bg-surface-container-high rounded">
              <Eye className="size-4.5 text-primary dark:text-primary-fixed-dim" />
            </div>
            <span className="font-label-caps text-label-caps text-on-surface font-bold uppercase tracking-wider">
              Live Preview &amp; Syntax Compiler
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-75 leading-relaxed">
            The instant code compiler output (SQL, JSON rules) will render here continuously as rules change in the canvas.
          </p>
        </div>
      </div>

    </div>
  )
}
