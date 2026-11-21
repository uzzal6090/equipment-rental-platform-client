"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { DashboardProfileProvider, useDashboardProfile } from "@/components/dashboard/dashboard-profile-context"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Package, Plus, Building2, ArrowRight, DollarSign, Calendar, Clock } from "lucide-react"

function OwnerDashboardContent() {
  const { backendProfile } = useDashboardProfile()
  const [analytics, setAnalytics] = React.useState<{
    totalListedEquipment: number
    equipmentByStatus: { pending: number; approved: number; rejected: number }
    completedRentals: number
    totalEarnings: number
    monthlyEarnings: Array<{ month: string; earnings: number }>
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
        const response = await (await import("@/lib/api")).apiRequest("/api/owner/analytics", { token })
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Analytics</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {backendProfile?.name || "Owner"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your equipment rental business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listed Equipment
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalListedEquipment ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All statuses
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Rentals
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{analytics?.completedRentals ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.notes?.completedRentals || "Booking data unavailable"}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(analytics?.totalEarnings ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.notes?.totalEarnings || "Payment data unavailable"}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {analytics?.equipmentByStatus?.pending ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Plus className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Add Equipment</CardTitle>
            </div>
            <CardDescription>
              Create a new equipment listing for rent. All new listings start as pending and require admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/owner/add-equipment"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              Create listing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Package className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">My Equipment</CardTitle>
            </div>
            <CardDescription>
              View and manage all your equipment listings across all statuses: pending, approved, and rejected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/owner/my-equipment"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              View equipment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">My Equipment Rental</CardTitle>
            </div>
            <CardDescription>
              Manage incoming rental requests and track your rental orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              View rentals
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Equipment Status Breakdown</CardTitle>
          </div>
          <CardDescription>
            Breakdown of your equipment by approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {analytics?.equipmentByStatus?.pending ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-500">
                {analytics?.equipmentByStatus?.approved ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-500">
                {analytics?.equipmentByStatus?.rejected ?? 0}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>
          {analytics?.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> {analytics.notes.completedRentals} | {analytics.notes.totalEarnings} | {analytics.notes.monthlyEarnings}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OwnerDashboardPage() {
  const { session, backendProfile, isPending, isProfileLoading, profileError, refetch } = useAuthSession()

  // Still loading session or profile
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">
            {isProfileLoading ? "Loading your profile..." : "Loading session..."}
          </p>
        </div>
      </div>
    )
  }

  // No valid session - redirect to login
  if (!session) {
    redirect("/login")
  }

  // Session exists but profile fetch failed - show error with retry
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Profile</h1>
            <p className="text-muted-foreground mb-6">{profileError}</p>
            <Button
              onClick={() => refetch()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Profile loaded but not an owner
  if (!backendProfile || backendProfile.role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Only equipment owners can access the Owner Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized Owner - render dashboard content with profile provider
  return (
    <DashboardProfileProvider backendProfile={backendProfile}>
      <OwnerDashboardContent />
    </DashboardProfileProvider>
  )
}