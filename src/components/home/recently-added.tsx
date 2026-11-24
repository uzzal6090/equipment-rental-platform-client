"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest } from "@/lib/api"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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

export function RecentlyAddedEquipment() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fallbackToPage1, setFallbackToPage1] = useState(false)
  const { session } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function fetchRecentlyAdded(page = 2) {
      setLoading(true)
      setError(null)
      try {
        const response = await apiRequest(`/api/equipment?sort=newest&limit=6&page=${page}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch equipment: ${response.status}`)
        }
        const data: EquipmentApiResponse = await response.json()
        if (!cancelled) {
          if (data.data?.equipment.length === 0 && page === 2) {
            // Fall back to page 1 if page 2 is empty
            setFallbackToPage1(true)
            const fallbackResponse = await apiRequest("/api/equipment?sort=newest&limit=6&page=1")
            if (fallbackResponse.ok) {
              const fallbackData: EquipmentApiResponse = await fallbackResponse.json()
              if (!cancelled) {
                setEquipment(fallbackData.data?.equipment ?? [])
              }
            }
          } else {
            setEquipment(data.data?.equipment ?? [])
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An unknown error occurred")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRecentlyAdded()

    return () => {
      cancelled = true
    }
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    const page = fallbackToPage1 ? 1 : 2
    void apiRequest(`/api/equipment?sort=newest&limit=6&page=${page}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch equipment: ${response.status}`)
        }
        const data: EquipmentApiResponse = await response.json()
        setEquipment(data.data?.equipment ?? [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleViewDetails = (id: string) => {
    if (!id || id === "undefined") {
      toast.error("Invalid equipment selection")
      return
    }
    if (!session) {
      router.push("/login")
      return
    }
    router.push(`/equipment/${id}`)
  }

  if (loading) {
    return (
      <section className="py-20" id="recently-added">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-border rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-80 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20" id="recently-added">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-32 bg-border rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-muted-foreground">{error}</div>
              <Button onClick={handleRetry} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!equipment || equipment.length === 0) {
    return (
      <section className="py-20" id="recently-added">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-32 bg-border rounded-full" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Recently Added
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-muted-foreground mb-6 max-w-md">
                No approved equipment available at the moment.
              </div>
              <Link
                href="/equipment"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-lg font-medium rounded-lg hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Explore All Equipment
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20" id="recently-added">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-border rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Recently Added
              {fallbackToPage1 && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  (showing newest equipment)
                </span>
              )}
            </h2>
          </div>
          <Link
            href="/equipment"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {equipment.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ x: -2 }}
              className="shrink-0 w-80 flex flex-col"
            >
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex flex-col gap-2">
                  <div
                    className="relative h-48 w-full overflow-hidden rounded-t-xl bg-muted"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        fill
                        sizes="200px"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold line-clamp-1">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.category} • {item.location}
                  </div>
                  <div className="mt-3 text-sm font-medium text-foreground">
                    ${item.rentalPrice} / {item.rentalType}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleViewDetails(item.id)}
                    className="w-full"
                    disabled={item.availableQuantity === 0}
                  >
                    {item.availableQuantity === 0 ? "Unavailable" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}