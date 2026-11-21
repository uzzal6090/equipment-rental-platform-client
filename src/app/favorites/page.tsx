"use client"

import * as React from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest, getAuthToken } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, RefreshCw, Heart, HeartOff, Truck, MapPin, Tag, X, ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface Equipment {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  location: string
  availableQuantity: number
  image: string | null
  status: string
  createdAt: string
}

interface FavoriteItem {
  id: string
  equipmentId: string
  createdAt: string
  equipment: Equipment
}

interface FavoritesApiResponse {
  success: boolean
  data?: {
    favorites: FavoriteItem[]
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

function FavoritesPageClient() {
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

  if (!backendProfile || backendProfile.role !== "customer") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">Only customers can access the Favorites page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/customer"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Favorites</h1>
                <p className="text-muted-foreground mt-1">Your saved equipment, all in one place.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-muted text-sm font-medium text-foreground">
                <Heart className="h-4 w-4 mr-1.5 text-accent" />
                <span id="favorites-count">0</span> saved
              </span>
            </div>
          </div>

          <Separator className="my-2" />

          <Suspense fallback={<FavoritesSkeleton />}>
            <FavoritesContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function FavoritesContent() {
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([])
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
  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set())

  const fetchFavorites = React.useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await apiRequest(`/api/favorites?page=${page}&limit=${pagination.limit}`, { token })
      const data: FavoritesApiResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to load favorites")
      }

      const responseData = data.data
      if (!responseData) {
        throw new Error("Invalid response format")
      }

      setFavorites(responseData.favorites)
      setPagination(prev => ({ ...prev, ...responseData.pagination }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  // Fetch on mount
  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      await fetchFavorites(1)
      if (mounted) {
        // State already set in fetchFavorites
      }
    }
    load()
    return () => { mounted = false }
  }, [fetchFavorites])

  // Update favorites count in header
  React.useEffect(() => {
    const countEl = document.getElementById("favorites-count")
    if (countEl) {
      countEl.textContent = pagination.total.toString()
    }
  }, [pagination.total])

  const handleRemoveFavorite = async (favoriteId: string) => {
    setRemovingIds(prev => new Set(prev).add(favoriteId))
    try {
      const token = await getAuthToken()
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await apiRequest(`/api/favorites/${favoriteId}`, {
        method: "DELETE",
        token,
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to remove favorite")
      }

      toast.success("Removed from favorites")
      setFavorites(prev => prev.filter(f => f.id !== favoriteId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove favorite")
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(favoriteId)
        return next
      })
    }
  }

  const handleRetry = () => fetchFavorites(pagination.page)

  if (loading) {
    return <FavoritesSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Favorites</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={handleRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 bg-muted rounded-full text-muted-foreground/50 mb-6">
          <HeartOff className="h-12 w-12" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">No Favorites Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start browsing equipment and save items you like for later rental.
        </p>
        <Link href="/equipment">
          <Button className="gap-2">
            <Truck className="h-4 w-4" />
            Browse Equipment
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Equipment</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden md:table-cell">Price</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Location</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Availability</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {favorites.map((favorite) => (
              <FavoriteRow
                key={favorite.id}
                favorite={favorite}
                onRemove={handleRemoveFavorite}
                isRemoving={removingIds.has(favorite.id)}
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
          onPageChange={fetchFavorites}
        />
      )}
    </div>
  )
}

function FavoriteRow({
  favorite,
  onRemove,
  isRemoving,
}: {
  favorite: FavoriteItem
  onRemove: (id: string) => void
  isRemoving: boolean
}) {
  const equipment = favorite.equipment
  const isAvailable = equipment.availableQuantity > 0 && equipment.status === "approved"

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {equipment.image ? (
              <Image
                src={equipment.image}
                alt={equipment.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/equipment/${equipment.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1 block"
            >
              {equipment.name}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Tag className="h-3.5 w-3.5" />
              <span>{equipment.category}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="text-sm text-foreground font-medium">{formatCurrency(equipment.rentalPrice)}</div>
        <div className="text-xs text-muted-foreground">per {equipment.rentalType.toLowerCase()}</div>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate block max-w-[200px]">{equipment.location}</span>
        </div>
      </td>
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isAvailable ? "bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400"}`}>
          {isAvailable ? (
            <>
              <Heart className="h-3 w-3" />
              {equipment.availableQuantity} available
            </>
          ) : (
            <>
              <HeartOff className="h-3 w-3" />
              Unavailable
            </>
          )}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/equipment/${equipment.id}`}
            className="px-4 py-2 text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/10 rounded-lg transition-colors whitespace-nowrap"
          >
            View Details
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(favorite.id)}
            disabled={isRemoving}
            className="text-destructive hover:bg-destructive/10 gap-1.5 whitespace-nowrap"
            aria-label="Remove from favorites"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Remove</span>
            {isRemoving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </Button>
        </div>
      </td>
    </tr>
  )
}

function FavoritesSkeleton() {
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
              <th className="text-left py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden md:table-cell"><div className="h-4 w-20 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-left py-3 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></th>
              <th className="text-right py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted" />
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden md:table-cell"><div className="h-4 w-20 bg-muted rounded" /></td>
                <td className="py-4 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-muted rounded" /></td>
                <td className="py-4 px-4 hidden lg:table-cell"><div className="h-6 w-24 bg-muted rounded-full" /></td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-8 w-24 bg-muted rounded-lg" />
                    <div className="h-8 w-20 bg-muted rounded-lg" />
                  </div>
                </td>
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

export default function FavoritesPage() {
  return <FavoritesPageClient />
}