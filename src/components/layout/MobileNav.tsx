"use client"

import * as React from "react"
import { useState } from "react"
import { Wrench, Eye, Table } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "results">("builder")

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant dark:border-outline z-40 flex items-center justify-around md:hidden shadow-lg transition-colors duration-200">
      
      {/* Builder Tab */}
      <button
        onClick={() => setActiveTab("builder")}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-all duration-200",
          activeTab === "builder" 
            ? "text-primary dark:text-primary-fixed-dim" 
            : "text-on-surface-variant opacity-60 hover:opacity-100"
        )}
      >
        <Wrench className={cn("size-5", activeTab === "builder" && "stroke-[2.5px]")} />
        <span className="font-label-caps text-[10px] mt-1 uppercase tracking-wider font-bold">
          Builder
        </span>
      </button>

      {/* Preview Tab */}
      <button
        onClick={() => setActiveTab("preview")}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-all duration-200",
          activeTab === "preview" 
            ? "text-primary dark:text-primary-fixed-dim" 
            : "text-on-surface-variant opacity-60 hover:opacity-100"
        )}
      >
        <Eye className={cn("size-5", activeTab === "preview" && "stroke-[2.5px]")} />
        <span className="font-label-caps text-[10px] mt-1 uppercase tracking-wider font-bold">
          Preview
        </span>
      </button>

      {/* Results Tab */}
      <button
        onClick={() => setActiveTab("results")}
        className={cn(
          "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-all duration-200",
          activeTab === "results" 
            ? "text-primary dark:text-primary-fixed-dim" 
            : "text-on-surface-variant opacity-60 hover:opacity-100"
        )}
      >
        <Table className={cn("size-5", activeTab === "results" && "stroke-[2.5px]")} />
        <span className="font-label-caps text-[10px] mt-1 uppercase tracking-wider font-bold">
          Results
        </span>
      </button>

    </div>
  )
}
