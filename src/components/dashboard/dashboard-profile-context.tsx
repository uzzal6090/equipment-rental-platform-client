"use client"

import * as React from "react"
import type { BackendProfile } from "@/hooks/use-auth-session"

interface DashboardProfileContextType {
  backendProfile: BackendProfile | null
}

const DashboardProfileContext = React.createContext<DashboardProfileContextType>({
  backendProfile: null,
})

export function DashboardProfileProvider({
  children,
  backendProfile,
}: {
  children: React.ReactNode
  backendProfile: BackendProfile | null
}) {
  return (
    <DashboardProfileContext.Provider value={{ backendProfile }}>
      {children}
    </DashboardProfileContext.Provider>
  )
}

export function useDashboardProfile() {
  const context = React.useContext(DashboardProfileContext)
  if (!context) {
    throw new Error("useDashboardProfile must be used within a DashboardProfileProvider")
  }
  return context
}