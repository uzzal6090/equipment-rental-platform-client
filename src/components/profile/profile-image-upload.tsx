"use client"

import * as React from "react"
import { Camera, Upload, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileImageUploadProps {
  currentImageUrl?: string | null
  onImageChange?: (file: File) => void
  isUploading?: boolean
  uploadError?: string | null
  disabled?: boolean
  size?: "sm" | "md" | "lg"
}

export function ProfileImageUpload({
  currentImageUrl,
  onImageChange,
  isUploading = false,
  uploadError = null,
  disabled = false,
  size = "md",
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const sizeConfig = {
    sm: { avatar: "size-20", button: "h-8 px-2 text-xs", container: "gap-2" },
    md: { avatar: "size-32", button: "h-10 px-3 text-sm", container: "gap-3" },
    lg: { avatar: "size-40", button: "h-12 px-4 text-base", container: "gap-4" },
  }[size]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    if (onImageChange) {
      onImageChange(file)
    }
  }

  const displayImage = previewUrl || currentImageUrl
  const hasImage = !!displayImage

  return (
    <div className={cn("flex flex-col items-center", sizeConfig.container)}>
      <div className="relative">
        <div className="relative">
          {hasImage ? (
            <Avatar className={sizeConfig.avatar}>
              <AvatarImage src={displayImage} alt="Profile photo" />
            </Avatar>
          ) : (
            <Avatar className={sizeConfig.avatar}>
              <AvatarFallback>
                <ImageIcon className="h-8 w-8 shrink-0" />
              </AvatarFallback>
            </Avatar>
          )}
          {/* Edit indicator badge */}
          <div className="absolute -bottom-1 -right-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => {
                const input = document.getElementById(
                  "profile-image-input"
                ) as HTMLInputElement | null
                input?.click()
              }}
              disabled={disabled || isUploading}
              aria-label="Change profile photo"
            >
              <Camera className="h-3 w-3 shrink-0" />
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
          disabled={disabled || isUploading}
        />

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
            <span className="text-xs text-muted-foreground">
              Uploading photo...
            </span>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="mt-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive">{uploadError}</span>
          </div>
        )}
      </div>

      {!hasImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.getElementById(
              "profile-image-input"
            ) as HTMLInputElement | null
            input?.click()
          }}
          disabled={disabled || isUploading}
          className="mt-3"
        >
          <Upload className="h-3 w-3 mr-1 shrink-0" />
          Upload photo
        </Button>
      )}
    </div>
  )
}
