"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  image_url?: string
  product_count: number
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [createImageUrl, setCreateImageUrl] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      image_url: createImageUrl,
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al crear categoría")
        return
      }

      setIsCreateOpen(false)
      setCreateImageUrl("")
      router.refresh()
    } catch (error) {
      console.error("Error creating category:", error)
      alert("Error al crear categoría")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCategory) return
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      image_url: editImageUrl,
    }

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al actualizar categoría")
        return
      }

      setEditingCategory(null)
      setEditImageUrl("")
      router.refresh()
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Error al actualizar categoría")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return

    setIsLoading(true)

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Error al eliminar categoría")
        return
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Error al eliminar categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>Agrega una nueva categoría de trabajos</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" name="slug" required placeholder="diseno-grafico" />
              </div>
              <div>
                <Label htmlFor="icon">Icono (emoji)</Label>
                <Input id="icon" name="icon" required placeholder="🎨" />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" required />
              </div>
              <ImageUpload
                onImageUpload={setCreateImageUrl}
                label="Imagen de Categoría"
                description="PNG, JPG, WebP hasta 10MB"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creando..." : "Crear Categoría"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            {category.image_url && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={category.image_url || "/placeholder.svg"}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {category.product_count} {category.product_count === 1 ? "trabajo" : "trabajos"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
              <div className="flex gap-2">
                <Dialog
                  open={editingCategory?.id === category.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      setEditingCategory(null)
                      setEditImageUrl("")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
                        setEditImageUrl(category.image_url || "")
                      }}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Categoría</DialogTitle>
                      <DialogDescription>Modifica los datos de la categoría</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Nombre</Label>
                        <Input id="edit-name" name="name" defaultValue={category.name} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-slug">Slug (URL)</Label>
                        <Input id="edit-slug" name="slug" defaultValue={category.slug} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-icon">Icono (emoji)</Label>
                        <Input id="edit-icon" name="icon" defaultValue={category.icon} required />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                          id="edit-description"
                          name="description"
                          defaultValue={category.description}
                          required
                        />
                      </div>
                      <ImageUpload
                        onImageUpload={setEditImageUrl}
                        currentImage={editImageUrl}
                        label="Imagen de Categoría"
                        description="PNG, JPG, WebP hasta 10MB"
                      />
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive bg-transparent"
                  onClick={() => handleDelete(category.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}