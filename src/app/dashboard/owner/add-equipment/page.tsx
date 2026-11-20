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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EquipmentImageUpload } from "@/components/equipment/equipment-image-upload"
import { apiRequest, getAuthToken } from "@/lib/api"
import { Loader2, Save, ArrowLeft, Shield, Building2, Package } from "lucide-react"
import { ALLOWED_CATEGORIES, ALLOWED_RENTAL_TYPES, ALLOWED_CONDITIONS, type Category, type RentalType, type Condition } from "@/constants/equipment-validation"

const equipmentSchema = z.object({
  name: z.string().min(2, "Equipment name must be at least 2 characters").max(200, "Equipment name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description is too long"),
  category: z.enum([...ALLOWED_CATEGORIES] as [string, ...string[]]),
  location: z.string().min(2, "Location must be at least 2 characters").max(200, "Location is too long"),
  rentalPrice: z.number().min(0, "Rental price must be a non-negative number").max(1000000, "Rental price is too high"),
  rentalType: z.enum([...ALLOWED_RENTAL_TYPES] as [string, ...string[]]),
  totalQuantity: z.number().int().min(1, "Quantity must be at least 1").max(10000, "Quantity is too high"),
  condition: z.enum([...ALLOWED_CONDITIONS] as [string, ...string[]]),
  brand: z.string().max(100, "Brand is too long").optional().or(z.literal("")),
  model: z.string().max(100, "Model is too long").optional().or(z.literal("")),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  rentalTerms: z.string().max(10000, "Rental terms are too long").optional().or(z.literal("")),
})

type EquipmentFormValues = z.infer<typeof equipmentSchema>

const RENTAL_TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
}

export default function AddEquipmentPage() {
  const { backendProfile, isPending } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      description: "",
      category: ALLOWED_CATEGORIES[0],
      location: "",
      rentalPrice: 0,
      rentalType: "daily",
      totalQuantity: 1,
      condition: "good",
      brand: "",
      model: "",
      image: "",
      rentalTerms: "",
    },
  })

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  if (!backendProfile || backendProfile.role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            Only equipment owners can access this page.
          </p>
        </div>
      </div>
    )
  }

  const handleImageChange = (url: string) => {
    setImageUrl(url)
    form.setValue("image", url)
    setUploadError(null)
  }

  const handleImageRemove = () => {
    setImageUrl(null)
    form.setValue("image", "")
  }

  async function onSubmit(values: EquipmentFormValues) {
    setIsSubmitting(true)
    setUploadError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }

      const submitData = {
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category,
        location: values.location.trim(),
        rentalPrice: values.rentalPrice,
        rentalType: values.rentalType,
        totalQuantity: values.totalQuantity,
        condition: values.condition,
        brand: values.brand?.trim() || undefined,
        model: values.model?.trim() || undefined,
        image: values.image?.trim() || undefined,
        rentalTerms: values.rentalTerms?.trim() || undefined,
      }

      const response = await apiRequest("/api/equipment", {
        method: "POST",
        body: JSON.stringify(submitData),
        token,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.error?.errors) {
          errorData.error.errors.forEach((e: { field: string; message: string }) => {
            form.setError(e.field as keyof EquipmentFormValues, { message: e.message })
          })
        }
        throw new Error(errorData.error?.message || "Failed to create equipment")
      }

      toast.success("Equipment listing created successfully! It is now pending admin approval.")
      form.reset()
      setImageUrl(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create equipment"
      toast.error(message)
      setUploadError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="h-10 w-10"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Equipment</h1>
            <p className="text-muted-foreground mt-1">
              Create a new equipment listing. All fields are required unless marked optional.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Equipment Details</CardTitle>
                <CardDescription>
                  Fill in all the details about your equipment. New listings start as <span className="font-medium text-yellow-500">Pending</span> and require admin approval before appearing publicly.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Equipment Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="e.g., Compact Excavator, DSLR Camera Kit"
                    {...form.register("name")}
                    disabled={isSubmitting}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the equipment, its features, and any important details for renters..."
                    {...form.register("description")}
                    disabled={isSubmitting}
                    rows={4}
                    className={form.formState.errors.description ? "border-destructive" : ""}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 10 characters, maximum 5000 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.getValues("category")}
                    onValueChange={(v) => form.setValue("category", v as Category)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="category" className={form.formState.errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    {...form.register("location")}
                    disabled={isSubmitting}
                    className={form.formState.errors.location ? "border-destructive" : ""}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalPrice">Rental Price ($) <span className="text-destructive">*</span></Label>
                  <Input
                    id="rentalPrice"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    {...form.register("rentalPrice", { valueAsNumber: true })}
                    disabled={isSubmitting}
                    className={form.formState.errors.rentalPrice ? "border-destructive" : ""}
                  />
                  {form.formState.errors.rentalPrice && (
                    <p className="text-sm text-destructive">{form.formState.errors.rentalPrice.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Per {RENTAL_TYPE_LABELS[form.getValues("rentalType")].toLowerCase()}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalType">Rental Type <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.getValues("rentalType")}
                    onValueChange={(v) => form.setValue("rentalType", v as RentalType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="rentalType" className={form.formState.errors.rentalType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select rental type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_RENTAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {RENTAL_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.rentalType && (
                    <p className="text-sm text-destructive">{form.formState.errors.rentalType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Available Quantity <span className="text-destructive">*</span></Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    {...form.register("totalQuantity", { valueAsNumber: true })}
                    disabled={isSubmitting}
                    className={form.formState.errors.totalQuantity ? "border-destructive" : ""}
                  />
                  {form.formState.errors.totalQuantity && (
                    <p className="text-sm text-destructive">{form.formState.errors.totalQuantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Equipment Condition <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.getValues("condition")}
                    onValueChange={(v) => form.setValue("condition", v as Condition)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="condition" className={form.formState.errors.condition ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_CONDITIONS.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {CONDITION_LABELS[condition]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.condition && (
                    <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand <span className="text-muted-foreground">(Optional)</span></Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Caterpillar, Canon, Ford"
                    {...form.register("brand")}
                    disabled={isSubmitting}
                    className={form.formState.errors.brand ? "border-destructive" : ""}
                  />
                  {form.formState.errors.brand && (
                    <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model <span className="text-muted-foreground">(Optional)</span></Label>
                  <Input
                    id="model"
                    placeholder="e.g., 420F2, EOS R5, Transit 350"
                    {...form.register("model")}
                    disabled={isSubmitting}
                    className={form.formState.errors.model ? "border-destructive" : ""}
                  />
                  {form.formState.errors.model && (
                    <p className="text-sm text-destructive">{form.formState.errors.model.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="rentalTerms">Rental Terms & Conditions <span className="text-muted-foreground">(Optional)</span></Label>
                  <Textarea
                    id="rentalTerms"
                    placeholder="e.g., Operator must be certified. Fuel not included. Delivery available for extra fee. Damage waiver required."
                    {...form.register("rentalTerms")}
                    disabled={isSubmitting}
                    rows={3}
                    className={form.formState.errors.rentalTerms ? "border-destructive" : ""}
                  />
                  {form.formState.errors.rentalTerms && (
                    <p className="text-sm text-destructive">{form.formState.errors.rentalTerms.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Maximum 10000 characters</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Equipment Image <span className="text-muted-foreground">(Optional)</span></Label>
                  <EquipmentImageUpload
                    currentImageUrl={imageUrl}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                    isUploading={false}
                    uploadError={uploadError}
                    disabled={isSubmitting}
                    size="lg"
                  />
                  {imageUrl && (
                    <p className="text-xs text-muted-foreground">
                      Image uploaded successfully. <Button variant="ghost" size="sm" onClick={handleImageRemove} className="h-auto p-0 text-xs">Remove</Button>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Status: Pending</p>
                    <p className="text-sm text-muted-foreground">
                      All new equipment listings are automatically set to &ldquo;Pending&rdquo; and require admin approval before they become visible to renters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mt-4">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Owner Information</p>
                    <p className="text-sm text-muted-foreground">
                      This equipment will be listed under your account: <span className="font-medium">{backendProfile.name}</span> ({backendProfile.email})
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Equipment Listing
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}