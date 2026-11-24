"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { redirect } from "next/navigation"
import { Loader2, AlertCircle, RefreshCw, Users, Package, Calendar, DollarSign, Clock, Building2, ArrowRight, TrendingUp as TrendingUpIcon } from "lucide-react"
import { MonthlyBookingChart } from "@/components/dashboard/MonthlyBookingChart"

function AdminDashboardContent({ analytics }: { analytics: {
  totalUsers: number
  totalEquipment: number
  totalBookings: number
  pendingApprovals: number
  completedRentals: number
  totalRevenue: number
  monthlyBookingStats: Array<{ month: string; bookings: number }>
  equipmentByStatus: { pending: number; approved: number; rejected: number }
  notes?: Record<string, string>
} | null }) {
  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num)
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  const metrics = [
    {
      title: "Total Users",
      value: formatNumber(analytics?.totalUsers ?? 0),
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: "Registered users",
    },
    {
      title: "Total Equipment",
      value: formatNumber(analytics?.totalEquipment ?? 0),
      icon: Package,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      description: "All equipment listings",
    },
    {
      title: "Total Bookings",
      value: formatNumber(analytics?.totalBookings ?? 0),
      icon: Calendar,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      description: analytics?.notes?.totalBookings || "Booking data unavailable",
    },
    {
      title: "Pending Approvals",
      value: formatNumber(analytics?.pendingApprovals ?? 0),
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      description: "Equipment awaiting review",
    },
    {
      title: "Completed Rentals",
      value: formatNumber(analytics?.completedRentals ?? 0),
      icon: TrendingUpIcon,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      description: analytics?.notes?.completedRentals || "Booking data unavailable",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(analytics?.totalRevenue ?? 0),
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      description: analytics?.notes?.totalRevenue || "Payment data unavailable",
    },
  ]

  const quickActions = [
    {
      title: "Browse Equipment",
      description: "Find equipment to rent",
      icon: Package,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      href: "/equipment",
    },
    {
      title: "My Profile",
      description: "Account settings",
      icon: Building2,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      href: "/profile",
    },
  ]

  return (
    <div className="space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Platform overview and management.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${metric.iconBg}`}>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-xs mt-0.5 truncate text-muted-foreground/70">
                      {metric.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section aria-labelledby="equipment-status-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="equipment-status-heading" className="text-lg font-semibold text-foreground">
              Equipment Status Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Breakdown of all equipment by approval status
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="text-3xl font-bold tabular-nums text-amber-500">
              {analytics?.equipmentByStatus?.pending ?? 0}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="text-3xl font-bold tabular-nums text-green-500">
              {analytics?.equipmentByStatus?.approved ?? 0}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Approved</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="text-3xl font-bold tabular-nums text-red-500">
              {analytics?.equipmentByStatus?.rejected ?? 0}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1">Rejected</div>
          </div>
        </div>
        {analytics?.notes && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> {analytics.notes.totalBookings} | {analytics.notes.completedRentals} | {analytics.notes.totalRevenue} | {analytics.notes.monthlyBookingStats}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="quick-actions-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="quick-actions-heading" className="text-lg font-semibold text-foreground">
              Quick Actions
            </h2>
            <p className="text-sm text-muted-foreground">
              Common administrative tasks
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-card border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:bg-accent/10"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${action.iconBg}`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground">{action.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="management-links-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="management-links-heading" className="text-lg font-semibold text-foreground">
              Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Access detailed management pages
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/users" className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">All Users</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage user roles and view registered users.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-3">
              Manage users
              <ArrowRight className="h-4 w-4 transition-transform hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <Link href="/dashboard/admin/equipment" className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">All Equipment</h3>
            <p className="text-sm text-muted-foreground mt-1">View and manage all equipment listings across all statuses.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-3">
              View equipment
              <ArrowRight className="h-4 w-4 transition-transform hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <Link href="/profile" className="bg-card border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
            <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">My Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary mt-3">
              View profile
              <ArrowRight className="h-4 w-4 transition-transform hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      {analytics?.monthlyBookingStats && analytics.monthlyBookingStats.length > 0 && (
        <MonthlyBookingChart data={analytics.monthlyBookingStats} />
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { session, backendProfile, isPending, isProfileLoading, profileError, refetch } = useAuthSession()
  const [analytics, setAnalytics] = React.useState<{
    totalUsers: number
    totalEquipment: number
    totalBookings: number
    pendingApprovals: number
    completedRentals: number
    totalRevenue: number
    monthlyBookingStats: Array<{ month: string; bookings: number }>
    equipmentByStatus: { pending: number; approved: number; rejected: number }
    notes?: Record<string, string>
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true)
      setError(null)
      try {
        const token = await (await import("@/lib/api")).getAuthToken()
        if (!token) {
          throw new Error("Authentication required")
        }
        const response = await (await import("@/lib/api")).apiRequest("/api/admin/analytics", { token })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to fetch analytics")
        }
        setAnalytics(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading analytics" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground mb-2">Unable to Load Analytics</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading session" />
          <p className="text-muted-foreground">
            {isProfileLoading ? "Loading your profile..." : "Loading session..."}
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  if (profileError) {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground mb-2">Unable to Load Profile</h1>
          <p className="text-muted-foreground mb-6">{profileError}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!backendProfile || backendProfile.role !== "admin") {
    return (
      <div className="bg-background min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can access the Admin Dashboard.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboardContent analytics={analytics} />
}