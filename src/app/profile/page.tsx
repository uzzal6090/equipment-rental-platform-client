"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthSession } from "@/hooks/use-auth-session"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { apiRequest, getAuthToken } from "@/lib/api"
import { User, Phone, MapPin, Save, Loader2, ShieldCheck, Building2, Truck } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function getRoleIcon(role: string) {
  switch (role) {
    case "admin":
      return <ShieldCheck className="h-4 w-4" />
    case "owner":
      return <Building2 className="h-4 w-4" />
    default:
      return <Truck className="h-4 w-4" />
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admin"
    case "owner":
      return "Owner"
    default:
      return "Customer"
  }
}

export default function ProfilePage() {
  const { session, user, backendProfile, isPending, refetch } = useAuthSession()
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Use backend profile as authoritative source for profile data
  // backendProfile has all fields including phone, address, role
  const profileName = backendProfile?.name || user?.name || ""
  const profileEmail = backendProfile?.email || user?.email || ""
  const profilePhone = backendProfile?.phone || ""
  const profileAddress = backendProfile?.address || ""
  const profileImage = session?.profileImage ?? user?.image ?? backendProfile?.profileImage

  React.useEffect(() => {
    if (backendProfile || user) {
      form.reset({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        address: profileAddress,
      })
    }
  }, [backendProfile, user, profileName, profileEmail, profilePhone, profileAddress, form])

  if (isPending || !session || !user) {
    return null
  }

  // Get role from backend profile (authoritative), fallback to "customer"
  const role = backendProfile?.role || "customer"

  async function requireAuthToken(): Promise<string> {
    const token = await getAuthToken()
    if (!token) {
      throw new Error("Authentication required. Please sign in again.")
    }
    return token
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true)
    setUploadError(null)
    try {
    const token = await requireAuthToken()
    const response = await apiRequest("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        phone: values.phone,
        address: values.address,
      }),
      token,
    })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile")
      }

      toast.success("Profile updated successfully!")
      await refetch()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile"
      toast.error(message)
      setUploadError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleImageChange(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please select an image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum size is 5MB.")
      return
    }

    setIsSaving(true)
    setUploadError(null)

    try {
      const base64 = await fileToDataUrl(file)
    const token = await requireAuthToken()
    const response = await apiRequest("/api/profile/image", {
      method: "POST",
      body: JSON.stringify({ imageData: base64 }),
      token,
    })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload image")
      }

      toast.success("Profile photo updated!")
      await refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
      setUploadError(message)
    } finally {
      setIsSaving(false)
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Failed to read image file"))
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex px-4 sm:px-6 lg:px-8">
        <main className="flex-1 w-full max-w-5xl mx-auto py-12">
          <Card>
            <CardHeader className="pb-8">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-accent" />
                <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
              </div>
              <CardDescription>
                Manage your personal information.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
                {/* Left Column: Profile Identity (~30%) */}
                <div className="lg:col-span-4 flex flex-col items-center space-y-6 pt-6 lg:pt-0 border-b lg:border-b-0 lg:border-r border-border">
                  <div className="flex flex-col items-center space-y-3">
            <ProfileImageUpload
              currentImageUrl={profileImage || null}
              onImageChange={handleImageChange}
              isUploading={isSaving}
              uploadError={uploadError}
              disabled={isSaving}
              size="lg"
            />
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-foreground truncate max-w-[200px]">
                      {profileName || "Account"}
                    </h2>
                    <div className="flex items-center justify-center gap-1">
                      {getRoleIcon(role)}
                      <p className="text-sm text-muted-foreground">
                        {getRoleLabel(role)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Personal Information (~70%) */}
                <div className="lg:col-span-8 pt-6 lg:pt-0 pb-8">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        {...form.register("name")}
                        disabled={isSaving}
                      />
                      {form.formState.errors.name && (
                        <span className="text-destructive text-sm">
                          {form.formState.errors.name.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        defaultValue={profileEmail}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed from the profile page.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <Label htmlFor="phone">Phone Number</Label>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...form.register("phone")}
                        disabled={isSaving}
                      />
                      {form.formState.errors.phone && (
                        <span className="text-destructive text-sm">
                          {form.formState.errors.phone.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <Label htmlFor="address">Address</Label>
                      </div>
                      <Input
                        id="address"
                        placeholder="123 Equipment Lane, Rental City"
                        {...form.register("address")}
                        disabled={isSaving}
                      />
                      {form.formState.errors.address && (
                        <span className="text-destructive text-sm">
                          {form.formState.errors.address.message}
                        </span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
