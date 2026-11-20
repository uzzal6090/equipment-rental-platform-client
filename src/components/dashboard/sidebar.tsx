"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import {
  LayoutDashboard,
  User,
  Package,
  Calendar,
  Sun,
  Moon,
  LogOut,
  Truck,
  Box,
  X,
  PanelLeft,
  UserCircle,
} from "lucide-react"
import { createPortal } from "react-dom"
import { useSidebar } from "./sidebar-context"

interface SidebarItem {
  href: string
  label: string
  icon: React.ElementType
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}

function getInitials(name: string | undefined | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function DashboardSidebar({
  items,
  className,
  isDashboardRoute = true,
}: {
  items: SidebarItem[]
  className?: string
  isDashboardRoute?: boolean
}) {
  const { session, user, backendProfile, isPending } = useAuthSession()
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"
  const { isCollapsed, toggleCollapsed } = useSidebar()
  
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const sidebarRef = React.useRef<HTMLElement>(null)

  const role = backendProfile?.role || "customer"
  const name = user?.name || backendProfile?.name || "User"
  const email = user?.email || backendProfile?.email || ""
  const profileImage = user?.image || backendProfile?.profileImage || session?.profileImage

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileOpen])

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileOpen])

  if (isPending) {
    return null
  }

  const sidebarWidth = isCollapsed ? "w-16" : "w-64"
  const sidebarWidthPx = isCollapsed ? 64 : 256

  const renderSidebarContent = () => (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-background border-r border-border flex flex-col transition-all duration-200 ease-in-out",
        sidebarWidth,
        className
      )}
      style={{ width: `${sidebarWidthPx}px` }}
      data-sidebar="true"
    >
      {/* USER IDENTITY — At top of sidebar */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 relative overflow-hidden">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <UserCircle className="h-6 w-6" />
            )}
            {!profileImage && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-accent">
                {getInitials(name)}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 rounded">
                {role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE — Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-foreground opacity-80 hover:bg-muted hover:text-foreground hover:opacity-100 transition-colors",
              isCollapsed && "justify-center px-3"
            )}
            aria-label={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* BOTTOM — Theme Toggle & Sign Out */}
      <div className="p-2 border-t border-border space-y-1.5 flex-shrink-0">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium text-foreground opacity-80 hover:bg-muted hover:text-foreground hover:opacity-100 transition-colors",
            isCollapsed && "justify-center px-3"
          )}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          {!isCollapsed && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
        </button>

        <button
          onClick={async () => {
            try {
              await authClient.signOut()
              toast.success("Signed out successfully")
            } catch {
              toast.error("Failed to sign out. Please try again.")
            }
          }}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium text-destructive opacity-80 hover:bg-muted hover:text-destructive hover:opacity-100 transition-colors",
            isCollapsed && "justify-center px-3"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )

  if (!isDashboardRoute) {
    return renderSidebarContent()
  }

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        createPortal(
          <>
            <div
              data-mobile-backdrop="true"
              className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <div
              data-mobile-drawer="true"
              className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border shadow-2xl lg:hidden flex flex-col animate-slide-in"
              style={{ width: "256px" }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <span className="font-semibold text-foreground">Menu</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-foreground hover:bg-muted rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Collapse Toggle in Mobile Drawer */}
              <div className="p-2 border-b border-border">
                <button
                  onClick={toggleCollapsed}
                  className={cn(
                    "flex items-center justify-center w-full px-2 py-2 rounded-lg text-foreground opacity-60 hover:bg-muted hover:opacity-100 transition-colors",
                    isCollapsed && "rotate-180"
                  )}
                  aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? <PanelLeft className="h-5 w-5 rotate-180" /> : <PanelLeft className="h-5 w-5" />}
                </button>
              </div>

              {/* User Identity in Mobile Drawer */}
              <div className="p-3 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 relative overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={name}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <UserCircle className="h-6 w-6" />
                    )}
                    {!profileImage && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-accent">
                        {getInitials(name)}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 rounded">
                        {role}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground opacity-80 hover:bg-muted hover:text-foreground hover:opacity-100 transition-colors"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="p-3 border-t border-border space-y-2">
                <button
                  onClick={() => {
                    setTheme(isDark ? "light" : "dark")
                    setIsMobileOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground opacity-80 hover:bg-muted hover:text-foreground hover:opacity-100 transition-colors"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDark ? "Light mode" : "Dark mode"}</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await authClient.signOut()
                      toast.success("Signed out successfully")
                    } catch {
                      toast.error("Failed to sign out. Please try again.")
                    }
                    setIsMobileOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive opacity-80 hover:bg-muted hover:text-destructive hover:opacity-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      )}

      {/* Mobile Menu Toggle Button (only visible on mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-background border border-border rounded-full shadow-lg text-foreground hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <PanelLeft className="h-6 w-6" />
        </button>
      </div>

      {renderSidebarContent()}
    </>
  )
}

/* Role-specific item arrays — only valid routes per role */

const OWNER_ITEMS: SidebarItem[] = [
  { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/dashboard/owner/my-equipment", label: "My Equipment", icon: Package },
  { href: "/rentals", label: "Rental Order", icon: Calendar },
]

const ADMIN_ITEMS: SidebarItem[] = [
  { href: "/dashboard/admin/users", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/dashboard/admin/equipment", label: "All Equipment", icon: Box },
]

const CUSTOMER_ITEMS: SidebarItem[] = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/rentals", label: "Rental Order", icon: Calendar },
  { href: "/equipment", label: "Browse Equipment", icon: Truck },
]

export function OwnerDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={OWNER_ITEMS} className={className} isDashboardRoute />
}

export function AdminDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={ADMIN_ITEMS} className={className} isDashboardRoute />
}

export function CustomerDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={CUSTOMER_ITEMS} className={className} isDashboardRoute />
}