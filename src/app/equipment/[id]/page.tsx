"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest, getAuthToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, MapPin, Calendar, ArrowLeft, Building2, User, Shield, Truck, Package, HardHat, Heart, HeartOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarDays } from "lucide-react"

interface FavoriteItem {
  id: string
  equipmentId: string
  createdAt: string
}

interface Equipment {
  id: string
  name: string
  description: string
  category: string
  rentalPrice: number
  rentalType: string
  location: string
  availableQuantity: number
  image: string | null
  rentalTerms: string | null
  owner: {
    name: string
    profileImage: string | null
  } | null
  status: string
  createdAt: string
  isFavorited?: boolean
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getRentalTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  }
  return labels[type] || type
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
  }
  return labels[status] || status
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 text-green-400"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 text-yellow-400"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function EquipmentDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { backendProfile } = useAuthSession()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null)

  const bookingSchema = z.object({
    startDate: z.string({ message: "Start date is required" }).refine(
      val => {
        if (!val) return false
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
        const parts = val.split("-")
        const year = Number(parts[0])
        const month = Number(parts[1])
        const day = Number(parts[2])
        const selected = new Date(year, month - 1, day)
        if (
          selected.getFullYear() !== year ||
          selected.getMonth() !== month - 1 ||
          selected.getDate() !== day
        ) {
          return false
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selected.setHours(0, 0, 0, 0)
        return selected >= today
      },
      { message: "Start date cannot be in the past" }
    ),
    endDate: z.string({ message: "End date is required" }),
    quantity: z.string({ message: "Quantity is required" }).refine(
      val => {
        const num = Number(val)
        if (isNaN(num) || !Number.isInteger(num) || num < 1) return false
        if (equipment && num > equipment.availableQuantity) return false
        return true
      },
      { message: "Quantity exceeds available quantity" }
    ),
    contactPhone: z.string({ message: "Contact number is required" }).min(1, { message: "Contact number is required" }),
    deliveryAddress: z.string({ message: "Delivery address is required" }).min(1, { message: "Delivery address is required" }),
    notes: z.string().optional(),
  })

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const startDate = form.watch("startDate", "")
  const endDate = form.watch("endDate", "")
  const quantity = form.watch("quantity", "1")

  useEffect(() => {
    if (equipment && startDate && endDate && quantity) {
      setCalculatedAmount(calculateRentalAmount(startDate, endDate, Number(quantity)))
    } else {
      setCalculatedAmount(null)
    }
  }, [equipment, startDate, endDate, quantity])

  function calculateRentalAmount(startDateValue: string, endDateValue: string, qty: string | number): number {
    if (!equipment) return 0
    const qtyNum = Number(qty)
    const start = new Date(startDateValue)
    const end = new Date(endDateValue)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return 0

    let rentalDays = diffDays
    switch (equipment.rentalType) {
      case "weekly":
        rentalDays = Math.ceil(diffDays / 7)
        break
      case "monthly":
        rentalDays = Math.ceil(diffDays / 30)
        break
      default:
        break
    }

    return equipment.rentalPrice * rentalDays * qtyNum
  }

  const onBookingSubmit = async (data: z.infer<typeof bookingSchema>) => {
    if (!equipment) return

    setIsBooking(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        toast.error("Authentication required. Please sign in.")
        return
      }

      const response = await apiRequest("/api/bookings", {
        method: "POST",
        token,
        body: JSON.stringify({
          equipmentId: equipment.id,
          startDate: data.startDate,
          endDate: data.endDate,
          quantity: Number(data.quantity),
          contactPhone: data.contactPhone,
          deliveryAddress: data.deliveryAddress,
          notes: data.notes || "",
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.error?.message || "Failed to create booking")
        return
      }

      if (!result.data?.checkoutUrl) {
        toast.error("Failed to retrieve checkout URL from server")
        return
      }

      setIsBookingModalOpen(false)
      window.location.href = result.data.checkoutUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setIsBooking(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function fetchEquipment() {
      const { id } = await props.params
      setIsLoading(true)
      setError(null)

      try {
        const token = await getAuthToken()
        if (!token) {
          if (!cancelled) setError("Authentication required")
          return
        }

        const response = await apiRequest(`/api/equipment/${id}`, { token })
        const data = await response.json()

        if (cancelled) return

        if (!response.ok || !data.success) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error(data.error?.message || "Failed to load equipment")
        }

        if (!cancelled) setEquipment(data.data.equipment)
      } catch (err) {
        if (cancelled) return
        if (err instanceof Error && err.message !== "NEXT_NOT_FOUND") {
          setError(err.message || "Failed to load equipment")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchEquipment()

    return () => {
      cancelled = true
    }
  }, [props.params])

  const handleFavoriteToggle = async () => {
    if (!equipment || isFavoriteLoading) return

    const isCustomer = backendProfile?.role === "customer"
    if (!isCustomer) {
      toast.error("Only customers can add favorites")
      return
    }

    if (equipment.status !== "approved") {
      toast.error("Only approved equipment can be favorited")
      return
    }

    setIsFavoriteLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        toast.error("Authentication required")
        return
      }

      if (equipment.isFavorited) {
        // Remove favorite - we need to find the favorite ID first
        // For now, we'll use the equipment ID as the favorite ID since we don't have it
        // Actually, we need to call the delete endpoint with the favorite ID
        // Let's fetch favorites to find the matching one, or we can add a delete by equipmentId endpoint
        // For simplicity, let's add a new endpoint or use the existing one with a different approach
        // The current API uses favorite ID, not equipment ID
        // We'll need to fetch the favorites list to find the favorite ID
        const response = await apiRequest("/api/favorites", { token })
        const data = await response.json()
        if (response.ok && data.success) {
          const favorite = data.data.favorites.find((f: FavoriteItem) => f.equipmentId === equipment.id)
          if (favorite) {
            const deleteResponse = await apiRequest(`/api/favorites/${favorite.id}`, {
              method: "DELETE",
              token,
            })
            const deleteData = await deleteResponse.json()
            if (deleteResponse.ok && deleteData.success) {
              setEquipment(prev => prev ? { ...prev, isFavorited: false } : null)
              toast.success("Removed from favorites")
            } else {
              throw new Error(deleteData.error?.message || "Failed to remove favorite")
            }
          }
        }
      } else {
        // Add favorite
        const response = await apiRequest("/api/favorites", {
          method: "POST",
          token,
          body: JSON.stringify({ equipmentId: equipment.id }),
        })
        const data = await response.json()
        if (response.ok && data.success) {
          setEquipment(prev => prev ? { ...prev, isFavorited: true } : null)
          toast.success("Added to favorites")
        } else {
          throw new Error(data.error?.message || "Failed to add favorite")
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update favorite")
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EquipmentDetailsSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Load Equipment</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!equipment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="relative h-[380px] max-h-[380px] w-full rounded-xl overflow-hidden bg-muted">
              {equipment.image ? (
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-contain transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>No image available</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="inline-flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(equipment.status)}`}>
                <Shield className="h-3 w-3 mr-1" />
                {getStatusLabel(equipment.status)}
              </span>
            </div>
          </div>

          <div className="space-y-5 lg:space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                {(() => {
                  switch (equipment.category) {
                    case "Construction Equipment":
                      return <HardHat className="h-4 w-4" />
                    case "Photography Equipment":
                      return <Package className="h-4 w-4" />
                    case "Vehicles & Transportation":
                      return <Truck className="h-4 w-4" />
                    default:
                      return <Building2 className="h-4 w-4" />
                  }
                })()}
                <span>{equipment.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{equipment.name}</h1>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Rental Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatCurrency(equipment.rentalPrice)}</p>
                <p className="text-sm text-muted-foreground mt-1">per {getRentalTypeLabel(equipment.rentalType).toLowerCase()}</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Rental Type</p>
                <p className="text-lg font-semibold text-foreground">{getRentalTypeLabel(equipment.rentalType)}</p>
                <p className="text-sm text-muted-foreground mt-1">billing cycle</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Available</p>
                <p className="text-lg font-semibold text-foreground">
                  {equipment.availableQuantity > 0
                    ? `${equipment.availableQuantity} in stock`
                    : "Out of stock"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {equipment.availableQuantity > 0 ? "Ready to rent" : "Unavailable"}
                </p>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                  <p className="text-foreground">{equipment.location}</p>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{equipment.description}</p>
              </CardContent>
            </Card>

            {equipment.rentalTerms && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rental Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{equipment.rentalTerms}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.owner ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden">
                      {equipment.owner.profileImage ? (
                        <Image
                          src={equipment.owner.profileImage}
                          alt={equipment.owner.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">{equipment.owner.name}</p>
                      <p className="text-sm text-muted-foreground">Equipment Owner</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Owner information not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 p-4 sm:p-5 bg-muted/50 rounded-xl border border-border">
          <h3 className="font-medium text-foreground mb-2">Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Save this equipment for later or proceed to booking.
          </p>
          <div className="flex flex-wrap gap-2">
            {backendProfile?.role === "customer" && equipment.status === "approved" && (
              <Button
                onClick={handleFavoriteToggle}
                disabled={isFavoriteLoading}
                variant={equipment.isFavorited ? "default" : "outline"}
                className="gap-2"
              >
                {isFavoriteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : equipment.isFavorited ? (
                  <HeartOff className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                {equipment.isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            )}
            <Button onClick={() => setIsBookingModalOpen(true)} disabled={isBooking || !backendProfile}>
              Book Now
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {backendProfile?.role === "customer" && equipment.status === "approved"
              ? "Select dates and quantity to book this equipment."
              : "Favorites and booking are only available for customers on approved equipment."}
          </p>
        </div>
      </div>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Equipment</DialogTitle>
            <DialogDescription>
              Select your rental dates and details for {equipment?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onBookingSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Rental Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                required
                min={new Date().toISOString().split("T")[0]}
                disabled={isBooking}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Rental End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                required
                disabled={isBooking}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Required Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register("quantity")}
                required
                disabled={isBooking}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                {...register("contactPhone")}
                required
                disabled={isBooking}
              />
              {errors.contactPhone && (
                <p className="text-xs text-destructive">{errors.contactPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input
                id="deliveryAddress"
                type="text"
                {...register("deliveryAddress")}
                required
                disabled={isBooking}
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                rows={3}
                disabled={isBooking}
                placeholder="Any special instructions for the owner..."
              />
            </div>

            {calculatedAmount !== null && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Estimated Total</p>
                <p className="font-bold">{formatCurrency(calculatedAmount)}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)} disabled={isBooking}>
                Cancel
              </Button>
              <Button type="submit" disabled={isBooking || !equipment}>
                {isBooking ? "Processing..." : "Proceed to Stripe Checkout"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

function EquipmentDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-4">
          <div className="h-[380px] max-h-[380px] w-full rounded-xl bg-muted" />
          <div className="h-8 w-40 bg-muted rounded-full" />
        </div>
        <div className="space-y-5 lg:space-y-6">
          <div>
            <div className="h-4 w-32 bg-muted rounded mb-2" />
            <div className="h-10 w-3/4 bg-muted rounded" />
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
          <div className="h-px bg-border" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-px bg-border" />
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-px bg-border" />
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-px bg-border" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
      <div className="h-32 bg-muted rounded-xl" />
    </div>
  )
}

export default EquipmentDetailsPage