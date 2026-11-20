"use client"

import * as React from "react"
import { AdminDashboardSidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context"
import { PanelLeft } from "lucide-react"

function AdminDashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, toggleCollapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <AdminDashboardSidebar />
      <main className="flex-1 pt-12 min-h-screen" style={{ marginLeft: isCollapsed ? "64px" : "256px" }}>
        {/* Top header with sidebar toggle */}
        <header className="sticky top-0 z-30 h-12 bg-background/80 backdrop-blur-sm border-b border-border flex items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg text-foreground opacity-60 hover:bg-muted hover:opacity-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <PanelLeft className="h-5 w-5 rotate-180" /> : <PanelLeft className="h-5 w-5" />}
          </button>
        </header>
        <div className="p-4 sm:p-6 lg:p-6">{children}</div>
      </main>
    </div>
  )
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminDashboardContent>{children}</AdminDashboardContent>
    </SidebarProvider>
  )
}