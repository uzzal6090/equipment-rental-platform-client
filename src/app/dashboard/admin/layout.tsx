"use client"

import * as React from "react"
import { AdminDashboardSidebar } from "@/components/dashboard/sidebar"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminDashboardSidebar />
      <main className="flex-1 ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}