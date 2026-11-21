"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest } from "@/lib/api"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  Tag,
  ArrowLeft,
  Filter,
  Loader2,
} from "lucide-react"

interface EquipmentItem {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  location: string
  availableQuantity: number
  image: string | null
  status: string
  featured: boolean
  createdAt: string
}

interface EquipmentApiResponse {
  success: boolean
  data: {
    equipment: EquipmentItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

const EQUIPMENT_IMAGE_ASPECT_RATIO = "aspect-[4/3]"

const RENTAL_TYPES = [
  { value: "", label: "All Types" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const

const SORT_OPTIONS = [
  { value: "newest", label: "Recently Added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const

const AVAILABILITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
] as const

const PRICE_RANGES = [
  { value: "", label: "Any Price", min: null, max: null },
  { value: "0-50", label: "Under $50", min: 0, max: 50 },
  { value: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { value: "100-200", label: "$100 - $200", min: 100, max: 200 },
  { value: "200-500", label: "$200 - $500", min: 200, max: 500 },
  { value: "500+", label: "$500+", min: 500, max: null },
] as const

type FilterKey = "search" | "category" | "rentalType" | "priceRange" | "availability" | "sort"

interface EquipmentPageClientProps {
  initialSearchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function getDashboardRoute(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin"
    case "owner":
      return "/dashboard/owner"
    case "customer":
      return "/dashboard/customer"
    default:
      return "/dashboard/customer"
  }
}

export function EquipmentPageClient({ initialSearchParams }: EquipmentPageClientProps) {
  const { session, backendProfile, isPending } = useAuthSession()
  const router = useRouter()

  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [search, setSearch] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [category, setCategory] = useState("")
  const [rentalType, setRentalType] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [availability, setAvailability] = useState("")
  const [sort, setSort] = useState("newest")

  const initialFetchDone = useRef(false)
  const isFetchingRef = useRef(false)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const buildQueryString = useCallback((overrides: Partial<{
    search: string
    category: string
    rentalType: string
    priceRange: string
    availability: string
    sort: string
    page: number
  }> = {}) => {
    const params = new URLSearchParams()
    const s = overrides.search ?? searchDebounced
    const c = overrides.category ?? category
    const rt = overrides.rentalType ?? rentalType
    const pr = overrides.priceRange ?? priceRange
    const a = overrides.availability ?? availability
    const so = overrides.sort ?? sort
    const p = overrides.page ?? pagination.page

    if (s) params.set("search", s)
    if (c) params.set("category", c)
    if (rt) params.set("rentalType", rt)
    if (pr) {
      const cfg = PRICE_RANGES.find((p) => p.value === pr)
      if (cfg) {
        if (cfg.min !== null) params.set("minPrice", String(cfg.min))
        if (cfg.max !== null) params.set("maxPrice", String(cfg.max))
      }
    }
    if (a) params.set("availability", a)
    if (so !== "newest") params.set("sort", so)
    if (p > 1) params.set("page", String(p))
    params.set("limit", String(pagination.limit))
    return params.toString()
  }, [searchDebounced, category, rentalType, priceRange, availability, sort, pagination.page, pagination.limit])

  const fetchEquipment = useCallback(async (queryString: string, isInitial = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (isInitial) {
      setInitialLoading(true)
    } else {
      setIsSearching(true)
    }
    setError(null)
    try {
      const response = await apiRequest(`/api/equipment?${queryString}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment: ${response.status}`)
      }
      const data: EquipmentApiResponse = await response.json()
      setEquipment(data.data?.equipment ?? [])
      setPagination(prev => ({ ...prev, ...data.data?.pagination }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSearching(false)
      setInitialLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initializeAndFetch() {
      const params = await initialSearchParams

      const initialSearch = params.search ? (Array.isArray(params.search) ? params.search[0] : params.search) : ""
      const initialCategory = params.category ? (Array.isArray(params.category) ? params.category[0] : params.category) : ""
      const initialRentalType = params.rentalType ? (Array.isArray(params.rentalType) ? params.rentalType[0] : params.rentalType) : ""
      const initialPriceRange = params.priceRange ? (Array.isArray(params.priceRange) ? params.priceRange[0] : params.priceRange) : ""
      const initialAvailability = params.availability ? (Array.isArray(params.availability) ? params.availability[0] : params.availability) : ""
      const initialSort = params.sort ? (Array.isArray(params.sort) ? params.sort[0] : params.sort) : "newest"
      const initialPage = params.page ? parseInt(Array.isArray(params.page) ? params.page[0] : params.page, 10) : 1

      if (!cancelled) {
        setSearch(initialSearch)
        setSearchDebounced(initialSearch)
        setCategory(initialCategory)
        setRentalType(initialRentalType)
        setPriceRange(initialPriceRange)
        setAvailability(initialAvailability)
        setSort(initialSort)
        if (!isNaN(initialPage) && initialPage > 0) {
          setPagination(prev => ({ ...prev, page: initialPage }))
        }
      }

      if (!cancelled) {
        await Promise.resolve()

        if (initialFetchDone.current) return
        initialFetchDone.current = true

        setError(null)
        try {
          const initialParams = new URLSearchParams()
          if (initialSearch) initialParams.set("search", initialSearch)
          if (initialCategory) initialParams.set("category", initialCategory)
          if (initialRentalType) initialParams.set("rentalType", initialRentalType)
          if (initialPriceRange) {
            const cfg = PRICE_RANGES.find((p) => p.value === initialPriceRange)
            if (cfg) {
              if (cfg.min !== null) initialParams.set("minPrice", String(cfg.min))
              if (cfg.max !== null) initialParams.set("maxPrice", String(cfg.max))
            }
          }
          if (initialAvailability) initialParams.set("availability", initialAvailability)
          if (initialSort !== "newest") initialParams.set("sort", initialSort)
          if (initialPage > 1) initialParams.set("page", String(initialPage))
          initialParams.set("limit", String(pagination.limit))

          await fetchEquipment(initialParams.toString(), true)
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
          }
        }
      }
    }

    initializeAndFetch()

    return () => {
      cancelled = true
    }
  }, [initialSearchParams, pagination.limit])

  // Debounce search input to avoid excessive API calls and URL updates
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      setSearchDebounced(search)
    }, 300)
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [search])

  // Sync URL with debounced search and other filters
  useEffect(() => {
    const urlParams = new URLSearchParams()
    if (searchDebounced) urlParams.set("search", searchDebounced)
    if (category) urlParams.set("category", category)
    if (rentalType) urlParams.set("rentalType", rentalType)
    if (priceRange) urlParams.set("priceRange", priceRange)
    if (availability) urlParams.set("availability", availability)
    if (sort !== "newest") urlParams.set("sort", sort)
    const newUrl = `/equipment${urlParams.toString() ? `?${urlParams.toString()}` : ""}`
    window.history.replaceState({}, "", newUrl)
  }, [searchDebounced, category, rentalType, priceRange, availability, sort, pagination.limit])

  // Trigger search API call when debounced search or other filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchEquipment calls setState for data fetching, which is expected in effects
    fetchEquipment(buildQueryString({ search: searchDebounced, page: 1 }))
  }, [searchDebounced, category, rentalType, priceRange, availability, sort, fetchEquipment, buildQueryString])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEquipment(buildQueryString({ page: 1 }))
  }

  const handleFilterChange = (filter: FilterKey, value: string) => {
    const setters: Record<FilterKey, (value: string) => void> = {
      search: (v) => { setSearch(v); setSearchDebounced(v); },
      category: setCategory,
      rentalType: setRentalType,
      priceRange: setPriceRange,
      availability: setAvailability,
      sort: setSort,
    }
    setters[filter](value)
    fetchEquipment(buildQueryString({ [filter]: value, page: 1 }))
  }

  const handleClearFilters = () => {
    setSearch("")
    setSearchDebounced("")
    setCategory("")
    setRentalType("")
    setPriceRange("")
    setAvailability("")
    setSort("newest")
    fetchEquipment(buildQueryString({
      search: "",
      category: "",
      rentalType: "",
      priceRange: "",
      availability: "",
      sort: "newest",
      page: 1,
    }))
  }

  const handleRetry = () => {
    fetchEquipment(buildQueryString())
  }

  const handleViewDetails = (id: string) => {
    if (!session) {
      router.push("/login")
      return
    }
    router.push(`/equipment/${id}`)
  }

  const hasActiveFilters = Boolean(category || rentalType || priceRange || availability || sort !== "newest")
  const dashboardRoute = getDashboardRoute(backendProfile?.role)
  const showBackButton = !!backendProfile?.role

  if (isPending) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Loading session...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EquipmentHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(12)].map((_, i) => (
              <EquipmentCardSkeleton key={i} />
            ))}
          </div>
          <PaginationSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EquipmentHeader
            search={search}
            onSearchChange={setSearch}
            onSearch={handleSearch}
            category={category}
            onCategoryChange={handleFilterChange}
            rentalType={rentalType}
            onRentalTypeChange={handleFilterChange}
            priceRange={priceRange}
            onPriceRangeChange={handleFilterChange}
            availability={availability}
            onAvailabilityChange={handleFilterChange}
            sort={sort}
            onSortChange={handleFilterChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            resultCount={pagination.total}
            dashboardRoute={dashboardRoute}
            showBackButton={showBackButton}
          />
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Unable to Load Equipment</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!equipment || equipment.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EquipmentHeader
            search={search}
            onSearchChange={setSearch}
            onSearch={handleSearch}
            category={category}
            onCategoryChange={handleFilterChange}
            rentalType={rentalType}
            onRentalTypeChange={handleFilterChange}
            priceRange={priceRange}
            onPriceRangeChange={handleFilterChange}
            availability={availability}
            onAvailabilityChange={handleFilterChange}
            sort={sort}
            onSortChange={handleFilterChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            resultCount={pagination.total}
            dashboardRoute={dashboardRoute}
            showBackButton={showBackButton}
          />
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Tag className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No equipment found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {hasActiveFilters
                ? "Try adjusting your search or filters to find what you're looking for."
                : "No approved equipment is available at the moment."}
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EquipmentHeader
          search={search}
          onSearchChange={setSearch}
          onSearch={handleSearch}
          category={category}
          onCategoryChange={handleFilterChange}
          rentalType={rentalType}
          onRentalTypeChange={handleFilterChange}
          priceRange={priceRange}
          onPriceRangeChange={handleFilterChange}
          availability={availability}
          onAvailabilityChange={handleFilterChange}
          sort={sort}
          onSortChange={handleFilterChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          resultCount={pagination.total}
          dashboardRoute={dashboardRoute}
          showBackButton={showBackButton}
        />

        {isSearching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(12)].map((_, i) => (
              <EquipmentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {equipment.map((item, index) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onPageChange={(page) => fetchEquipment(buildQueryString({ page }))}
          />
        )}
      </div>
    </div>
  )
}

function EquipmentHeader({
  search,
  onSearchChange,
  onSearch,
  category,
  onCategoryChange,
  rentalType,
  onRentalTypeChange,
  priceRange,
  onPriceRangeChange,
  availability,
  onAvailabilityChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  resultCount,
  dashboardRoute,
  showBackButton,
}: {
  search: string
  onSearchChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  category: string
  onCategoryChange: (filter: FilterKey, value: string) => void
  rentalType: string
  onRentalTypeChange: (filter: FilterKey, value: string) => void
  priceRange: string
  onPriceRangeChange: (filter: FilterKey, value: string) => void
  availability: string
  onAvailabilityChange: (filter: FilterKey, value: string) => void
  sort: string
  onSortChange: (filter: FilterKey, value: string) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  resultCount: number
  dashboardRoute: string
  showBackButton: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
          {showBackButton && (
            <Link
              href={dashboardRoute}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">All Equipment</h1>
            <p className="text-muted-foreground mt-1">
              {resultCount} {resultCount === 1 ? "item" : "items"} found
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2 shrink-0 sm:ms-auto">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <form onSubmit={onSearch} className="space-y-4 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:gap-3 sm:items-end">
        <div className="relative min-w-0">
          <label htmlFor="equipment-search" className="sr-only">Search equipment</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            id="equipment-search"
            type="search"
            placeholder="Search by name, location, or category..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 pl-12 pr-4 text-base"
            autoComplete="off"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="category" className="sr-only">Category</label>
          <Select value={category} onValueChange={(v) => onCategoryChange("category", v ?? "")}>
            <SelectTrigger id="category" className="h-12">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="Construction Equipment">Construction Equipment</SelectItem>
              <SelectItem value="Photography Equipment">Photography Equipment</SelectItem>
              <SelectItem value="Vehicles & Transportation">Vehicles & Transportation</SelectItem>
              <SelectItem value="Agriculture Equipment">Agriculture Equipment</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Event Equipment">Event Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="rentalType" className="sr-only">Rental Type</label>
          <Select value={rentalType} onValueChange={(v) => onRentalTypeChange("rentalType", v ?? "")}>
            <SelectTrigger id="rentalType" className="h-12">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {RENTAL_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="priceRange" className="sr-only">Price Range</label>
          <Select value={priceRange} onValueChange={(v) => onPriceRangeChange("priceRange", v ?? "")}>
            <SelectTrigger id="priceRange" className="h-12">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="availability" className="sr-only">Availability</label>
          <Select value={availability} onValueChange={(v) => onAvailabilityChange("availability", v ?? "")}>
            <SelectTrigger id="availability" className="h-12">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="sort" className="sr-only">Sort By</label>
          <Select value={sort} onValueChange={(v) => onSortChange("sort", v ?? "")}>
            <SelectTrigger id="sort" className="h-12">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {category && (
            <FilterChip label={`Category: ${category}`} onRemove={() => onCategoryChange("category", "")} />
          )}
          {rentalType && (
            <FilterChip label={`Type: ${RENTAL_TYPES.find((r) => r.value === rentalType)?.label}`} onRemove={() => onRentalTypeChange("rentalType", "")} />
          )}
          {priceRange && (
            <FilterChip label={`Price: ${PRICE_RANGES.find((p) => p.value === priceRange)?.label}`} onRemove={() => onPriceRangeChange("priceRange", "")} />
          )}
          {availability && (
            <FilterChip label={`Availability: ${AVAILABILITY_OPTIONS.find((a) => a.value === availability)?.label}`} onRemove={() => onAvailabilityChange("availability", "")} />
          )}
          {sort !== "newest" && (
            <FilterChip label={`Sort: ${SORT_OPTIONS.find((s) => s.value === sort)?.label}`} onRemove={() => onSortChange("sort", "newest")} />
          )}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-primary/70 transition-colors" aria-label={`Remove ${label} filter`}>
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

function EquipmentCard({
  item,
  onViewDetails,
  index,
}: {
  item: EquipmentItem
  onViewDetails: (id: string) => void
  index: number
}) {
  const isAvailable = item.availableQuantity > 0 && item.status === "approved"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col overflow-hidden group">
        <CardHeader className="flex flex-col gap-2 p-4 pt-4 pb-2">
          <div
            className={cn(
              "relative h-48 w-full overflow-hidden rounded-xl bg-muted",
              EQUIPMENT_IMAGE_ASPECT_RATIO
            )}
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No image available
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <span className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm",
                item.status === "approved"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400"
                  : item.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 text-yellow-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400"
              )}>
                {item.status}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-background/90 backdrop-blur rounded-full text-muted-foreground">
                {item.rentalType}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 pb-2">
          <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
            {item.name}
          </CardTitle>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>{item.category}</span>
            <span className="text-[10px] uppercase tracking-wider text-accent">•</span>
            <MapPin className="h-3.5 w-3.5" />
            <span>{item.location}</span>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(item.rentalPrice)}
            </span>
            <span className={cn(
              "text-sm font-medium",
              isAvailable ? "text-green-600 dark:text-green-400" : "text-destructive"
            )}>
              {isAvailable
                ? `Available: ${item.availableQuantity}`
                : "Unavailable"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t border-border/50">
          <Button
            onClick={() => onViewDetails(item.id)}
            className="w-full"
            disabled={!isAvailable}
          >
            {isAvailable ? "View Details" : "Unavailable"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function EquipmentCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-2 p-4 pt-4 pb-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="mt-4 flex justify-between items-baseline">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

function EquipmentHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse mt-1" />
        </div>
      </div>
      <Separator className="animate-pulse" />
      <div className="space-y-4 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:gap-3 sm:items-end">
        <div className="relative min-w-0">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="w-full sm:w-48">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="w-full sm:w-48">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="w-full sm:w-56">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="w-full sm:w-48">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="w-full sm:w-56">
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-1 mt-8 animate-pulse">
      <div className="h-10 w-10 bg-muted rounded" />
      <div className="h-10 w-10 bg-muted rounded" />
      <div className="h-10 w-10 bg-muted rounded" />
      <span className="px-2 text-muted-foreground">...</span>
      <div className="h-10 w-10 bg-muted rounded" />
      <div className="h-10 w-10 bg-muted rounded" />
      <div className="h-10 w-10 bg-muted rounded" />
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
        <ChevronLeft className="h-4 w-4" />
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
        <ChevronRight className="h-4 w-4" />
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