"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import type { MobileTab } from "@/components/layout/MobileNav"

interface MobileTabContextValue {
  activeTab: MobileTab
  setActiveTab: (tab: MobileTab) => void
}

const MobileTabContext = createContext<MobileTabContextValue>({
  activeTab: "builder",
  setActiveTab: () => {},
})

export function MobileTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<MobileTab>("builder")
  return (
    <MobileTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </MobileTabContext.Provider>
  )
}

export function useMobileTab(): MobileTabContextValue {
  return useContext(MobileTabContext)
}
