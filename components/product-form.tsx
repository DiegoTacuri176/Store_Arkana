"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { ImageUpload } from "@/components/image-upload"
import { MultiImageUpload } from "@/components/multi-image-upload"

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] || "") 
  
  const [images, setImages] = useState<string[]>(product?.images && Array.isArray(product.images) ? product.images.slice(1) : [])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("[v0] Error loading categories:", err))
  }, [])

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || 0,
    categoryId: product?.categoryId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = AuthService.getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      if (!imageUrl) {
        alert("Debes subir una Imagen Principal para el producto.")
        setLoading(false);
        return;
      }

      const finalImages = [imageUrl, ...images]; 
      
      
      const submitData = {
        ...formData,
        images: finalImages, 
      }

      if (product) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        })

        if (!res.ok) throw new Error("Error updating product")
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...submitData,
            sellerId: user.id,
          }),
        })

        if (!res.ok) throw new Error("Error creating product")
      }

      router.push("/dashboard/products")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      alert("Error al guardar el producto. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleSecondaryImages = (uploadedImages: string[]) => {
      setImages(uploadedImages);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Proporciona los detalles principales de tu trabajo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Trabajo</Label>
            <Input
              id="title"
              placeholder="Ej: Logo Minimalista para Startups"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe tu trabajo, qué incluye, técnicas utilizadas, etc."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagen Principal</CardTitle>
          <CardDescription>Sube la imagen principal de tu trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={setImageUrl}
            currentImage={imageUrl}
            label="Imagen del Producto"
            description="PNG, JPG, WebP hasta 10MB"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes Secundarias</CardTitle>
          <CardDescription>Sube imágenes adicionales de tu trabajo (máximo 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiImageUpload
            onImagesUpload={handleSecondaryImages}
            currentImages={images} 
            maxImages={5}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : product ? "Actualizar Trabajo" : "Publicar Trabajo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}