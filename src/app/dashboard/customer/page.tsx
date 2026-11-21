"use client"

import * as React from "react"
import Link from "next/link"
import { useAuthSession } from "@/hooks/use-auth-session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Calendar, Heart, User, ArrowRight, Package } from "lucide-react"

export default function CustomerDashboardPage() {
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

  // Profile loaded but not a customer
  if (!backendProfile || backendProfile.role !== "customer") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-8 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Only customers can access the Customer Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome, {backendProfile?.name || "Customer"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your personal dashboard for managing rentals and favorites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">My Rentals</CardTitle>
            </div>
            <CardDescription>
              View and manage your rental orders, upcoming bookings, and rental history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              View my rentals
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Heart className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Favorites</CardTitle>
            </div>
            <CardDescription>
              View equipment you&apos;ve saved for later rental.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/favorites"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              View favorites
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-accent/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">My Profile</CardTitle>
            </div>
            <CardDescription>
              Manage your account settings, profile information, and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors group"
            >
              Edit profile
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common actions for your rental experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/equipment"
              className="p-4 bg-muted/50 rounded-lg text-center hover:bg-muted transition-colors group"
            >
              <Package className="h-8 w-8 mx-auto text-accent mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-foreground">Browse Equipment</div>
              <div className="text-xs text-muted-foreground mt-1">Find equipment to rent</div>
            </Link>
            <Link
              href="/rentals"
              className="p-4 bg-muted/50 rounded-lg text-center hover:bg-muted transition-colors group"
            >
              <Calendar className="h-8 w-8 mx-auto text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-foreground">My Rentals</div>
              <div className="text-xs text-muted-foreground mt-1">Track your orders</div>
            </Link>
            <Link
              href="/profile"
              className="p-4 bg-muted/50 rounded-lg text-center hover:bg-muted transition-colors group"
            >
              <User className="h-8 w-8 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-foreground">My Profile</div>
              <div className="text-xs text-muted-foreground mt-1">Account settings</div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}