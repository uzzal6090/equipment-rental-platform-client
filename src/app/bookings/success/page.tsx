"use client"

import * as React from "react"
import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { redirect } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest, getAuthToken } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface CheckoutStatusData {
  status: string
  booking?: {
    id: string
    totalPrice: number
    startDate: string
    endDate: string
    quantity: number
    bookingStatus: string
    paymentStatus: string
    bookingDate: string
    createdAt: string
    equipmentId: string
    userId: string
    ownerId: string
    stripeSessionId: string
    stripePaymentIntentId: string | null
    checkoutIntent: string
  }
  bookingCreated?: boolean
  sessionId?: string
}

interface CheckoutStatusResponse {
  success: boolean
  data?: CheckoutStatusData
  error?: {
    message: string
    code: string
  }
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm sm:text-base">Loading...</p>
      </div>
    </div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { session, isPending } = useAuthSession()
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "failed" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<CheckoutStatusData | null>(null)
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    if (isPending) return

    if (!sessionId) {
      setStatus("error")
      setErrorMessage("No payment session found in the URL.")
      return
    }

    void verifySession()
  }, [sessionId, isPending])

  async function verifySession() {
    if (verifiedRef.current) return
    verifiedRef.current = true

    setStatus("verifying")

    try {
      const token = await getAuthToken()
      if (!token) {
        setStatus("error")
        setErrorMessage("Authentication required. Please sign in to verify your payment.")
        return
      }

      const response = await apiRequest(`/api/bookings/checkout/${sessionId}`, { token })
      const result: CheckoutStatusResponse = await response.json()

      if (!response.ok || !result.success) {
        setStatus("failed")
        setErrorMessage(result.error?.message || "Failed to verify payment status.")
        return
      }

      const { status: paymentStatus, booking, bookingCreated } = result.data ?? {}

      if (paymentStatus === "paid") {
        setStatus("success")
        setPaymentData({ status: paymentStatus, booking, bookingCreated, sessionId: sessionId ?? undefined })
      } else {
        setStatus("failed")
        setErrorMessage(`Payment was not completed (status: ${paymentStatus}).`)
      }
    } catch (err) {
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Failed to verify payment.")
    }
  }

  // Not authenticated - redirect to login while preserving session_id
  if (!session) {
    if (isPending) {
      return null
    }
    if (sessionId) {
      redirect("/login?session_id=" + encodeURIComponent(sessionId))
    } else {
      redirect("/login")
    }
  }

  // Pending auth state
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm sm:text-base">Verifying payment...</p>
        </div>
      </div>
    )
  }

  // Error state (missing session ID or network error)
  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="py-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-destructive text-center">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-4 sm:px-6 text-center">
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">{errorMessage}</p>
            <Button onClick={() => window.location.reload()} className="w-full py-3">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Failed payment state (unpaid, expired, etc.)
  if (status === "failed") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="py-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-destructive text-center">Payment Not Completed</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-4 sm:px-6 text-center">
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">{errorMessage}</p>
            <Button onClick={() => router.push("/equipment")} className="w-full py-3">
              Browse Equipment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (status === "success" && paymentData) {
    const booking = paymentData.booking
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="py-6">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-foreground text-center">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-4 sm:px-6">
            <p className="text-muted-foreground mb-6 text-center text-sm sm:text-base">
              Your payment has been confirmed and your booking is active.
            </p>
            {booking && (
              <div className="space-y-3 mb-6">
                <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base gap-2">
                  <span className="text-muted-foreground">Equipment ID</span>
                  <span className="text-foreground font-medium text-right">{booking.equipmentId}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base gap-2">
                  <span className="text-muted-foreground">Rental Period</span>
                  <span className="text-foreground font-medium text-right">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base gap-2">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="text-foreground font-medium text-right">{booking.quantity}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base gap-2 font-bold">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-foreground text-right">{formatCurrency(booking.totalPrice)}</span>
                </div>
              </div>
            )}
            {!booking && paymentData.bookingCreated === false && (
              <p className="text-xs text-muted-foreground mb-6 text-center">
                Payment confirmed, but booking record was not created. Please contact support.
              </p>
            )}
            <Button onClick={() => router.push("/rentals")} className="w-full mt-2 py-3">
              View My Rentals
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verifying state
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm sm:text-base">Verifying payment...</p>
      </div>
    </div>
  )
}
