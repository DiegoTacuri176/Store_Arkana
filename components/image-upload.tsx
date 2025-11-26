"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  label?: string
  description?: string
  maxSize?: number // in MB
  userId?: string // <--- Nueva prop opcional
}

export function ImageUpload({
  onImageUpload,
  currentImage,
  label = "Imagen",
  description = "PNG, JPG, WebP hasta 10MB",
  maxSize = 10,
  userId, // <--- Desestructuramos
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de archivo no válido. Solo se permiten JPEG, PNG, WebP y GIF.")
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo excede el límite de ${maxSize}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      // Si se proporcionó un userId, lo agregamos a la petición
      if (userId) {
        formData.append("userId", userId)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al subir la imagen")
      }

      const data = await response.json()
      onImageUpload(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview ? (
        <div className="group relative aspect-square overflow-hidden rounded-lg border">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => {
              setPreview(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
          className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary hover:bg-accent"
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
                <p className="mt-2 text-sm text-muted-foreground">Arrastra la imagen aquí o haz clic</p>
                <p className="text-xs text-muted-foreground">{description}</p>
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
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}