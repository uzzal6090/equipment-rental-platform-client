"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Logo } from "@/components/brand/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Menu, X, User, Home, Truck, DollarSign, Building2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/equipment", label: "All Equipment", icon: Truck },
  { href: "/#about", label: "About", icon: Building2 },
  { href: "/#contact", label: "Contact", icon: DollarSign },
  { href: "/#how-it-works", label: "How It Works", icon: Truck },
  { href: "/rentals", label: "My Rentals", icon: DollarSign },
]

function getDashboardLink(role: string | null): { href: string; label: string; icon: React.ElementType } | null {
  if (role === "owner") {
    return { href: "/dashboard/owner", label: "Dashboard", icon: Building2 }
  }
  if (role === "admin") {
    return { href: "/dashboard/admin/users", label: "Dashboard", icon: Building2 }
  }
  return null
}

export function Navbar() {
  const { session, user, backendProfile, isPending } = useAuthSession()
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const hamburgerRef = React.useRef<HTMLButtonElement | null>(null)
  const isAuthenticated = !!session
  const isDark = theme === "dark"
  const isDashboardRoute = pathname.startsWith("/dashboard")

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen])

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
      closeButtonRef.current?.focus()
    } else {
      document.body.style.overflow = ""
      hamburgerRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  React.useEffect(() => {
    if (!isMobileMenuOpen) return
    function handleFocusIn(event: FocusEvent) {
      const drawer = document.querySelector('[data-mobile-drawer="true"]')
      if (drawer && !drawer.contains(event.target as Node)) {
        const firstFocusable = drawer.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable) {
          ;(firstFocusable as HTMLElement).focus()
        }
      }
    }
    document.addEventListener("focusin", handleFocusIn)
    return () => document.removeEventListener("focusin", handleFocusIn)
  }, [isMobileMenuOpen])

  if (isPending) {
    return null
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await authClient.signOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  const isActive = (href: string) => pathname === href

  const dashboardLink = getDashboardLink(backendProfile?.role ?? null)

  const accountTriggerClasses =
    "flex items-center gap-2 min-w-[44px] h-9 px-3 text-sm font-medium text-foreground rounded-lg border border-border transition-all hover:bg-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background shrink-0"

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <Logo size={16} className="text-foreground font-semibold tracking-tight" />
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all ${isActive(link.href) ? "text-accent" : "text-foreground"} hover:bg-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-md`}
            >
              {link.label}
            </Link>
          ))}
          {dashboardLink && (
            <Link
              key={dashboardLink.href}
              href={dashboardLink.href}
              className={`text-sm font-medium transition-all ${isActive(dashboardLink.href) ? "text-accent" : "text-foreground"} hover:bg-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-md`}
            >
              {dashboardLink.label}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-md p-1"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
              >
                Create account
              </Link>
            </>
          ) : isDashboardRoute ? (
            <>
              {/* On dashboard routes, show account indicator WITH dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={accountTriggerClasses}>
                  <Avatar className="shrink-0">
                    <AvatarImage
                      src={(session?.profileImage ?? user?.image ?? backendProfile?.profileImage) || undefined}
                      alt="Profile"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4 shrink-0" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground truncate min-w-0 max-w-[120px]">
                    {user?.name || backendProfile?.name || "Account"}
                  </span>
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    className="truncate"
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                  >
                    {isDark ? "Light mode" : "Dark mode"}
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    className="text-destructive data-[disabled]:pointer-events-auto"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className={accountTriggerClasses}>
                  <Avatar className="shrink-0">
                    <AvatarImage
                      src={(session?.profileImage ?? user?.image ?? backendProfile?.profileImage) || undefined}
                      alt="Profile"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4 shrink-0" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground truncate min-w-0 max-w-[120px]">
                    {user?.name || backendProfile?.name || "Account"}
                  </span>
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    className="truncate"
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                  >
                    {isDark ? "Light mode" : "Dark mode"}
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    className="text-destructive data-[disabled]:pointer-events-auto"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <button
            ref={hamburgerRef}
            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen
        ? createPortal(
            <>
              <div
                data-mobile-backdrop="true"
                className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm lg:hidden"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              <div
                data-mobile-drawer="true"
                className="fixed inset-y-0 right-0 z-51 w-[min(88vw,380px)] max-h-full bg-card border-l border-border shadow-2xl lg:hidden flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
                  <Logo size={14} className="text-foreground font-semibold tracking-tight" />
                  <button
                    ref={closeButtonRef}
                    onClick={closeMobileMenu}
                    aria-label="Close menu"
                    className="p-2 text-foreground hover:bg-muted rounded-lg focus-visible:outline-ring focus-visible:ring-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-6 space-y-1">
                  {NAV_LINKS.map(
                    (link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <link.icon
                          className={`h-5 w-5 shrink-0 ${isActive(link.href) ? "text-accent-foreground" : "text-foreground"}`}
                        />
                        {link.label}
                      </Link>
                    )
                  )}
                  {dashboardLink && (
                    <Link
                      key={dashboardLink.href}
                      href={dashboardLink.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(dashboardLink.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <dashboardLink.icon
                        className={`h-5 w-5 shrink-0 ${isActive(dashboardLink.href) ? "text-accent-foreground" : "text-foreground"}`}
                      />
                      {dashboardLink.label}
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <User className="h-5 w-5 shrink-0" />
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 transition-colors"
                      >
                        <User className="h-5 w-5 shrink-0" />
                        Register
                      </Link>
                    </>
                  )}
                  {isAuthenticated && !isDashboardRoute && (
                    <div className="pt-4 border-t border-border">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 w-full h-9 px-3 text-left border border-border rounded-lg bg-background text-foreground hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        <Avatar className="shrink-0">
                          <AvatarImage
                            src={(session?.profileImage ?? user?.image ?? backendProfile?.profileImage) || undefined}
                            alt="Profile"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4 shrink-0" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-foreground truncate min-w-0">
                          {user?.name || backendProfile?.name || "Account"}
                        </span>
                      </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem
                            className="truncate"
                            onClick={() => { router.push("/profile"); closeMobileMenu() }}
                          >
                            Profile
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                          >
                            {isDark ? "Light mode" : "Dark mode"}
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                          >
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </nav>
  )
}
