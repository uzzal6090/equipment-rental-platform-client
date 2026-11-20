"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <span
      className={cn("text-foreground", className)}
      style={{ fontSize: size }}
    >
      Equipment Rental Platform
    </span>
  )
}
