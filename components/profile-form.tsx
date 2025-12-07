"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"
import { ImageUpload } from "@/components/image-upload"

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatar || "/placeholder-user.jpg")
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    university: user.university || "",
    major: user.major || "",
  })

  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null)

  const displayAvatarUrl = uploadedAvatarUrl || currentAvatarUrl

  const handleImageUpload = (url: string) => {
    setUploadedAvatarUrl(url)
  }

  const handleAvatarSave = async (url: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      })

      if (!res.ok) throw new Error("Error updating profile picture")

      setCurrentAvatarUrl(url)
      setUploadedAvatarUrl(null)
      alert("Foto de perfil actualizada exitosamente")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile picture:", error)
      alert("Error al actualizar la foto de perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let dataToSubmit = formData

      if (uploadedAvatarUrl) {
        await handleAvatarSave(uploadedAvatarUrl)
        setCurrentAvatarUrl(uploadedAvatarUrl)
        setUploadedAvatarUrl(null)
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      if (!res.ok) throw new Error("Error updating profile")

      alert("Perfil actualizado exitosamente")
      router.refresh()
      // redirect to profile page
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      alert("Error al actualizar el perfil. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Tu foto aparecerá en tus trabajos publicados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={displayAvatarUrl} style={{ objectFit: "cover" }} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            {/* Pasamos el userId al componente */}
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImage={currentAvatarUrl}
              label="Cambiar Foto"
              description="JPG, PNG. Máximo 10MB"
              userId={user.id}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu información de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
            <p className="text-xs text-muted-foreground">El email no puede ser modificado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              placeholder="Cuéntanos sobre ti y tu trabajo..."
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="university">Universidad</Label>
              <Input
                id="university"
                placeholder="Ej: Universidad Nacional"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Carrera</Label>
              <Input
                id="major"
                placeholder="Ej: Diseño Gráfico"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}