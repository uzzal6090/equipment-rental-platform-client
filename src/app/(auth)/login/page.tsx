"use client"

import * as React from "react"
import { Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AuthCentered, AuthCenteredCard, AuthBrand } from "@/components/auth/auth-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]+$/

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const returnSessionId = searchParams.get("session_id")
  const validReturnSessionId =
    returnSessionId !== null && SESSION_ID_PATTERN.test(returnSessionId)
      ? returnSessionId
      : null

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (result && "error" in result && result.error) {
        toast.error(result.error.message || "Login failed. Please try again.")
        return
      }

      toast.success("Welcome back!")

      if (validReturnSessionId) {
        router.push("/bookings/success?session_id=" + validReturnSessionId)
      } else {
        router.push("/")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCentered>
      <AuthCenteredCard
        brand={
          <AuthBrand heading="Sign In" />
        }
        form={
          <Card className="w-full">
            <CardContent className="pt-0">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    {...form.register("email")}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.email && (
                    <span className="text-destructive text-sm">{form.formState.errors.email.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    error={form.formState.errors.password?.message}
                    placeholder="Enter your password"
                    {...form.register("password")}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pt-6 flex flex-col w-full">
              <Separator orientation="horizontal" className="my-4 w-full" />
              <div className="w-full">
                <GoogleSignInButton className="w-full" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Create account
                </Link>
              </p>
            </CardFooter>
          </Card>
        }
      />
    </AuthCentered>
  )
}