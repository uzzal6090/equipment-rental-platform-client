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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: "",
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        image: values.image || undefined,
      })

      if (result && "error" in result && result.error) {
        toast.error(result.error.message || "Registration failed. Please try again.")
        return
      }

      toast.success("Account created successfully!")
      router.push("/")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed. Please try again."
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
            title="Create your account"
            subtitle="Join the equipment rental platform to start renting equipment and managing your bookings."
          />
        }
        form={
          <Card className="w-full">
            <CardHeader className="pb-6">
              <AuthHeader
                title="Sign up"
                description="Enter your details below to create your account."
              />
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="John Doe"
                    {...form.register("name")}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.name && (
                    <span className="text-destructive text-sm">{form.formState.errors.name.message}</span>
                  )}
                </div>
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
                  <Label htmlFor="image">Profile Photo URL</Label>
                  <Input
                    id="image"
                    type="url"
                    autoComplete="off"
                    placeholder="https://example.com/photo.jpg"
                    {...form.register("image")}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.image && (
                    <span className="text-destructive text-sm">{form.formState.errors.image.message}</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter a direct image link for your profile photo.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters, with one uppercase and one lowercase letter.
                  </p>
                  <PasswordInput
                    id="password"
                    label="Password"
                    autoComplete="new-password"
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
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pt-6">
              <Separator orientation="horizontal" className="my-4" />
              <div className="flex items-center justify-center w-full">
                <GoogleSignInButton className="w-full md:w-[260px]" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        }
      />
    </AuthLayout>
  )
}
