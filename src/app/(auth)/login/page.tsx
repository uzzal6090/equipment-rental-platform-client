"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AuthLayout, AuthTwoColumn, AuthHeader, BrandVisual } from "@/components/auth/auth-layout"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
      router.push("/")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Login failed. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthTwoColumn
        brand={
          <BrandVisual
            title="Welcome back"
            subtitle="Sign in to your account to manage your equipment rentals and track your orders."
          />
        }
        form={
          <Card className="w-full">
            <CardHeader className="pb-6">
              <AuthHeader
                title="Sign in"
                description="Enter your email and password below."
              />
            </CardHeader>
            <CardContent>
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
                    label="Password"
                    autoComplete="current-password"
                    error={form.formState.errors.password?.message}
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
            <CardFooter className="pt-6">
              <Separator orientation="horizontal" className="my-4" />
              <div className="flex items-center justify-center w-full">
                <GoogleSignInButton className="w-full md:w-[260px]" />
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
    </AuthLayout>
  )
}
