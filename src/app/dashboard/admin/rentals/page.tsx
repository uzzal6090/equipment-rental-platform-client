"use client"

import * as React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest, getAuthToken } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, Receipt, CalendarDays, User, Building2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

interface Equipment {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  location: string
  image: string | null
  status: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  profileImage: string | null
}

interface Owner {
  id: string
  name: string
  email: string
  phone: string | null
  profileImage: string | null
}

interface Rental {
  id: string
  equipmentId: string
  startDate: string
  endDate: string
  quantity: number
  bookingStatus: string
  paymentStatus: string
  totalPrice: number
  bookingDate: string
  createdAt: string
  equipment: Equipment | null
  customer: Customer | null
  owner: Owner | null
}

interface RentalsApiResponse {
  success: boolean
  data?: {
    rentals: Rental[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  error?: {
    message: string
    code: string
  }
}

function AdminRentalsPageClient() {
  const { session, backendProfile, isPending, isProfileLoading, profileError, refetch } = useAuthSession()

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

  if (!session) {
    redirect("/login")
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Profile</h1>
            <p className="text-muted-foreground mb-6">{profileError}</p>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!backendProfile || backendProfile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">Only administrators can access the All Rentals page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">All Rental Orders</h1>
                <p className="text-muted-foreground mt-1">View and monitor all rental orders across the platform.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-muted text-sm font-medium text-foreground">
                <Receipt className="h-4 w-4 mr-1.5 text-accent" />
                <span id="rentals-count">0</span> orders
              </span>
            </div>
          </div>

          <Separator className="my-2" />

          <Suspense fallback={<AdminRentalsSkeleton />}>
            <AdminRentalsContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function AdminRentalsContent() {
  const [rentals, setRentals] = React.useState<Rental[]>([])
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchRentals = React.useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await apiRequest(`/api/admin/rentals?page=${page}&limit=${pagination.limit}`, { token })
      const data: RentalsApiResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to load rental orders")
      }

      const responseData = data.data
      if (!responseData) {
        throw new Error("Invalid response format")
      }

      setRentals(responseData.rentals)
      setPagination(prev => ({ ...prev, ...responseData.pagination }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rental orders")
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  // Fetch on mount
  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      await fetchRentals(1)
      if (mounted) {
        // State already set in fetchRentals
      }
    }
    load()
    return () => { mounted = false }
  }, [fetchRentals])

  // Update rentals count in header
  React.useEffect(() => {
    const countEl = document.getElementById("rentals-count")
    if (countEl) {
      countEl.textContent = pagination.total.toString()
    }
  }, [pagination.total])

  const handleRetry = () => fetchRentals(pagination.page)

  if (loading) {
    return <AdminRentalsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Rental Orders</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={handleRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-muted rounded-full text-muted-foreground/50 mb-6">
          <CalendarDays className="h-12 w-12" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">No Rental Orders Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Rental orders will appear here when customers book equipment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Customer Information</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden md:table-cell">Owner Information</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden md:table-cell">Equipment Information</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Rental Duration</th>
              <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden md:table-cell">Required Quantity</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden md:table-cell">Booking Amount</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Payment Status</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Booking Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rentals.map((rental) => (
              <AdminRentalRow
                key={rental.id}
                rental={rental}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={fetchRentals}
        />
      )}
    </div>
  )
}

function AdminRentalRow({
  rental,
}: {
  rental: Rental
}) {
  const equipment = rental.equipment
  const customer = rental.customer
  const owner = rental.owner

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 relative overflow-hidden">
            {customer?.profileImage ? (
              <img
                src={customer.profileImage}
                alt={customer.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            {!customer?.profileImage && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-accent">
                {customer?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{customer?.name ?? "Unknown Customer"}</p>
            <p className="text-sm text-muted-foreground truncate">{customer?.email ?? "No email"}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 relative overflow-hidden">
            {owner?.profileImage ? (
              <img
                src={owner.profileImage}
                alt={owner.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            {!owner?.profileImage && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-400">
                {owner?.name?.charAt(0).toUpperCase() || "O"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{owner?.name ?? "Unknown Owner"}</p>
            <p className="text-sm text-muted-foreground truncate">{owner?.email ?? "No email"}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {rental.equipment?.image ? (
              <img
                src={rental.equipment.image}
                alt={rental.equipment.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/equipment/${equipment?.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1 block"
            >
              {equipment?.name ?? "Unknown Equipment"}
            </Link>
            <p className="text-sm text-muted-foreground">{equipment?.category ?? ""}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <div className="text-sm text-foreground">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell text-center">
        <div className="text-sm text-foreground font-medium">{rental.quantity}</div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell text-right">
        <div className="text-sm text-foreground font-medium">{formatCurrency(rental.totalPrice)}</div>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(rental.paymentStatus)}`}>
          {getPaymentStatusLabel(rental.paymentStatus)}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getBookingStatusClass(rental.bookingStatus)}`}>
          {getBookingStatusLabel(rental.bookingStatus)}
        </span>
      </td>
    </tr>
  )
}

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  }
  return labels[status] || status
}

function getPaymentStatusClass(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 text-yellow-400"
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400"
    case "refunded":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 text-blue-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getBookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: "Confirmed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  }
  return labels[status] || status
}

function getBookingStatusClass(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 text-yellow-400"
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 text-blue-400"
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function AdminRentalsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>
      <div className="h-px bg-border" />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4"><div className="h-4 w-28 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden md:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden md:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden lg:table-cell"><div className="h-4 w-28 bg-muted rounded" /></th>
              <th className="text-center py-3 px-4 hidden md:table-cell"><div className="h-4 w-16 bg-muted rounded" /></th>
              <th className="text-right py-3 px-4 hidden md:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-right py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted" />
                    <div className="space-y-1">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></td>
                <td className="py-4 px-4 hidden md:table-cell text-center"><div className="h-4 w-12 bg-muted rounded" /></td>
                <td className="py-4 px-4 hidden md:table-cell text-right"><div className="h-4 w-20 bg-muted rounded" /></td>
                <td className="py-4 px-4 hidden lg:table-cell"><div className="h-6 w-24 bg-muted rounded-full" /></td>
                <td className="py-4 px-4 text-right"><div className="h-6 w-24 bg-muted rounded-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-1 mt-8">
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}) {
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        aria-label="Previous page"
      >
        <span className="h-4 w-4">←</span>
      </Button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={page === currentPage ? `Page ${page}, current` : `Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Next page"
      >
        <span className="h-4 w-4">→</span>
      </Button>
    </nav>
  )
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = [1]

  if (currentPage > 3) {
    pages.push("ellipsis")
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)

  return pages
}

export default function AdminRentalsPage() {
  return <AdminRentalsPageClient />
}