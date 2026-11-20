"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Mail, Phone } from "lucide-react"

export function Footer() {
  const { setTheme, theme } = useTheme()
  const isDark = theme === "dark"
  const currentYear = 2026
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-foreground font-semibold tracking-tight text-lg">
                  Equipment Rental Platform
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A premium equipment rental marketplace connecting you with
                verified equipment owners for affordable, flexible rentals.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="p-1.5 text-foreground hover:bg-muted rounded-md transition-colors"
                  aria-label="Toggle theme"
                >
                  {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <span className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Platform</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-accent transition-colors">
                    All Equipment
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-accent transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-accent transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-accent transition-colors">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Rentals</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#about" className="hover:text-accent transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/equipment" className="hover:text-accent transition-colors">
                    Browse Categories
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-accent transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-accent transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Reach out through our contact page</p>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Support available via contact form</p>
                </li>
              </ul>
              <div className="mt-6 flex gap-4">
<a
                  href="#"
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.21.66-.48 0-.23-.01-1.02-.01-1.59-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.92 1.03 2.41 1.03 3 1.03.89 0 1.58-.6 1.58-1.33 0-.51-.16-.92-.38-1.22C13.48 11.29 12 10.19 12 8.31c0-.85.28-1.54.7-2.07-.07-.2-.3-1.02.15-2.12 0 0 .6-.24 2.2-.86.63-.18 1.3-.27 2-.27.67 0 1.37.09 2 .27 1.6.63 2.2.86 2.2.86.45 1.1.22 1.85.16 2.12.44.53.7 1.66.7 2.07 0 1.85-.89 3-.89 3 0 .32.16.62.07.48C21.38 10.03 24 6.4 24 12c0 5.523-4.477 10-10 10S2 17.523 2 12C2 6.477 6.477 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-muted-foreground">
                &copy; {currentYear} Equipment Rental Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
