"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-background px-4 sm:px-6",
        className
      )}
    >
      <div className="w-full max-w-[960px]">{children}</div>
    </div>
  )
}

export interface AuthTwoColumnProps {
  brand: React.ReactNode
  form: React.ReactNode
}

export function AuthTwoColumn({ brand, form }: AuthTwoColumnProps) {
  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-8">
      <div className="flex-1 lg:flex-[0.52] order-first lg:order-none">
        {brand}
      </div>
      <div className="flex-1 lg:flex-[0.48]">
        {form}
      </div>
    </div>
  )
}

export function AuthHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function BrandHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Equipment Rental Platform
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
    </div>
  )
}

export function BrandVisual({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <Logo size={40} className="text-foreground" />
      </div>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed text-center">{subtitle}</p>
      </div>
      <div className="space-y-6">
        <FeatureRow title="Discover Equipment" description="Browse our catalog of rental equipment." />
        <FeatureRow title="Flexible Rental Periods" description="Choose rental periods that fit your schedule." />
        <FeatureRow title="Manage Your Rentals" description="Track your bookings in one place." />
      </div>
    </div>
  )
}

function FeatureRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckIcon className="flex-shrink-0 h-5 w-5 text-primary" />
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
