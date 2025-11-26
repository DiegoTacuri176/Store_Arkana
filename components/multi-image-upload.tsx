"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface MultiImageUploadProps {
  onImagesUpload: (urls: string[]) => void
  currentImages?: string[]
  label?: string
  description?: string
  maxImages?: number
  maxSize?: number // in MB
}

export function MultiImageUpload({
  onImagesUpload,
  currentImages = [],
  label = "Imágenes",
  description = "PNG, JPG, WebP hasta 10MB",
  maxImages = 5,
  maxSize = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(currentImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    setError(null)

    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const filesToUpload: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de archivo no válido. Solo se permiten JPEG, PNG, WebP y GIF.")
        return
      }

      if (file.size > maxSize * 1024 * 1024) {
        setError(`El archivo excede el límite de ${maxSize}MB`)
        return
      }

      filesToUpload.push(file)
    }

    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Error al subir la imagen")
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesUpload(newImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir las imágenes")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      handleFileSelect(e.currentTarget.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesUpload(newImages)
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={image || "/placeholder.svg"}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
          className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:border-primary hover:bg-accent"
        >
          <div className="text-center">
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Subiendo...</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Arrastra imágenes aquí o haz clic</p>
                <p className="text-xs text-muted-foreground">
                  {description} ({images.length}/{maxImages})
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}
