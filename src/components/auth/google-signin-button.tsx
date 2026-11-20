"use client"

import * as React from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

interface GoogleSignInButtonProps {
  className?: string
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleSignIn = async () => {
    setIsPending(true)
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        disableRedirect: true,
      })

      const socialResult = result as { url?: string } | null
      if (socialResult?.url) {
        window.location.href = socialResult.url
      } else {
        toast.error("Unable to start Google sign-in. Please try again.")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed. Please try again."
      toast.error(message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      disabled={isPending}
      className={className}
    >
      <Mail className="mr-2 h-4 w-4" />
      {isPending ? "Signing in with Google..." : "Sign in with Google"}
    </Button>
  )
}
