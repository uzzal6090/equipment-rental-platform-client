"use client"

import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { Logo } from "@/components/brand/logo"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Truck,
  DollarSign,
  User,
  Package,
  Calendar,
  Sun,
  Moon,
  Users,
} from "lucide-react"

interface SidebarItem {
  href: string
  label: string
  icon: React.ElementType
}

interface DashboardSidebarProps {
  items: SidebarItem[]
  className?: string
}

export function DashboardSidebar({ items, className }: DashboardSidebarProps) {
  const { user, backendProfile, isPending } = useAuthSession()
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"

  if (isPending) {
    return null
  }

  // Get role from backend profile (authoritative), fallback to "customer"
  const role = backendProfile?.role || "customer"

  // Select sidebar items based on actual role
  let selectedItems = items
  if (role === "admin") {
    selectedItems = ADMIN_ITEMS
  } else if (role === "owner") {
    selectedItems = OWNER_ITEMS
  } else {
    selectedItems = CUSTOMER_ITEMS
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border flex flex-col",
        className
      )}
    >
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <Logo size={24} className="text-foreground" />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {selectedItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground opacity-80 hover:bg-muted hover:text-foreground hover:opacity-100 transition-colors"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/50">
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name || backendProfile?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || backendProfile?.email || ""}
            </p>
            <p className="text-[10px] font-semibold text-primary-foreground uppercase tracking-wider mt-1">
              {role}
            </p>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}

const CUSTOMER_ITEMS: SidebarItem[] = [
  { href: "/dashboard/customer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equipment", label: "Browse Equipment", icon: Truck },
  { href: "/rentals", label: "My Rentals", icon: DollarSign },
  { href: "/profile", label: "Profile", icon: User },
]

const OWNER_ITEMS: SidebarItem[] = [
  { href: "/dashboard/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equipment", label: "Manage Equipment", icon: Package },
  { href: "/rentals", label: "Rental Orders", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
]

const ADMIN_ITEMS: SidebarItem[] = [
  { href: "/dashboard/admin/users", label: "All Users", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
]

export function CustomerDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={CUSTOMER_ITEMS} className={className} />
}

export function OwnerDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={OWNER_ITEMS} className={className} />
}

export function AdminDashboardSidebar({ className }: { className?: string }) {
  return <DashboardSidebar items={ADMIN_ITEMS} className={className} />
}
