"use client"

import * as React from "react"
import { Camera, Upload, Loader2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiRequest, getAuthToken } from "@/lib/api"
import { toast } from "sonner"

interface EquipmentImageUploadProps {
  currentImageUrl?: string | null
  onImageChange?: (url: string) => void
  onImageRemove?: () => void
  isUploading?: boolean
  uploadError?: string | null
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function EquipmentImageUpload({
  currentImageUrl,
  onImageChange,
  onImageRemove,
  isUploading = false,
  uploadError = null,
  disabled = false,
  size = "md",
}: EquipmentImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const sizeConfig = {
    sm: { preview: "h-24 w-24", button: "h-8 px-2 text-xs", container: "gap-2" },
    md: { preview: "h-32 w-32", button: "h-10 px-3 text-sm", container: "gap-3" },
    lg: { preview: "h-40 w-40", button: "h-12 px-4 text-base", container: "gap-4" },
  }[size]

  const handleFileSelect = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please select an image.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum size is 5MB.")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    try {
      const base64 = await fileToDataUrl(file)
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }

      const response = await apiRequest("/api/equipment/image", {
        method: "POST",
        body: JSON.stringify({ imageData: base64 }),
        token,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || "Failed to upload image")
      }

      const data = await response.json()
      const imageUrl = data.data?.imageUrl

      if (!imageUrl) {
        throw new Error("No image URL returned from upload")
      }

      if (onImageChange) {
        onImageChange(imageUrl)
      }

      toast.success("Equipment image uploaded!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image"
      toast.error(message)
      if (uploadError) {
        // The parent component can handle this via uploadError prop if needed
      }
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (onImageRemove) {
      onImageRemove()
    }
  }

  const displayImage = previewUrl || currentImageUrl
  const hasImage = !!displayImage

  return (
    <div className={cn("flex flex-col items-center", sizeConfig.container)}>
      <div className="relative w-full">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl overflow-hidden transition-colors",
            sizeConfig.preview,
            hasImage ? "border-transparent" : "border-border",
            isDragging ? "border-accent bg-accent/5" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {hasImage ? (
            <img
              src={displayImage}
              alt="Equipment preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              <Camera className="h-8 w-8 shrink-0 mb-2" />
              <span className="text-sm">Drag & drop or click to upload</span>
              <span className="text-xs text-muted-foreground/70">PNG, JPG, WebP up to 5MB</span>
            </div>
          )}

          {hasImage && !isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
              aria-label="Remove image"
              disabled={disabled}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
              e.target.value = ""
            }}
            className="sr-only"
            disabled={disabled || isUploading}
            id="equipment-image-input"
          />
        </div>

        {isUploading && (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
            <span className="text-xs text-muted-foreground">
              Uploading image...
            </span>
          </div>
        )}

        {uploadError && (
          <div className="mt-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive">{uploadError}</span>
          </div>
        )}

        {!hasImage && !isUploading && !disabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.getElementById("equipment-image-input") as HTMLInputElement | null
              input?.click()
            }}
            className="mt-3 w-full"
            disabled={isUploading}
          >
            <Upload className="h-3 w-3 mr-1 shrink-0" />
            Upload Image
          </Button>
        )}
      </div>
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read image file"))
    reader.readAsDataURL(file)
  })
}