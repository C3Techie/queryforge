"use client"

import { MobileNav } from "./MobileNav"
import { useMobileTab } from "@/lib/mobileTabContext"

export function MobileNavWrapper() {
  const { activeTab, setActiveTab } = useMobileTab()
  return <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
}
