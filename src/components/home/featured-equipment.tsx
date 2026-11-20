"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest } from "@/lib/api"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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

export function FeaturedEquipment() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function fetchFeatured() {
      setLoading(true)
      setError(null)
      try {
        const response = await apiRequest("/api/equipment?sort=newest&limit=6")
        if (!response.ok) {
          throw new Error(`Failed to fetch equipment: ${response.status}`)
        }
        const data: EquipmentApiResponse = await response.json()
        if (!cancelled) {
          setEquipment(data.data?.equipment ?? [])
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

    fetchFeatured()

    return () => {
      cancelled = true
    }
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    void apiRequest("/api/equipment?sort=newest&limit=6")
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
    if (!session) {
      router.push("/login")
      return
    }
    router.push(`/equipment/${id}`)
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-8 w-32" />
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 mb-8">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-muted-foreground">
                No approved equipment available at the moment.
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="h-8 w-32 bg-border rounded-full"
            />
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Featured Equipment
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {equipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="flex flex-col h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardHeader className="flex flex-col gap-2">
                    <div
                      className={cn(
                        "relative h-48 w-full overflow-hidden rounded-t-xl bg-muted",
                        EQUIPMENT_IMAGE_ASPECT_RATIO
                      )}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 400px"
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
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {item.status}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.rentalType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {item.name}
                    </CardTitle>
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                      <span>{item.category}</span>
                      <span className="text-[10px] uppercase tracking-wider text-accent">•</span>
                      <span>{item.location}</span>
                    </div>
                    <div className="mt-4 flex justify-between items-baseline">
                      <span className="text-xl font-bold text-foreground">
                        ${item.rentalPrice}
                      </span>
<span className="text-sm text-muted-foreground">
          {item.availableQuantity > 0
            ? `Available: ${item.availableQuantity}`
            : "Unavailable"}
        </span>
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}
