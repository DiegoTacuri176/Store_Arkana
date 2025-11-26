"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/auth"
import { Database } from "@/lib/db"
import { Star } from "lucide-react"

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault()
    setError("")

    const user = AuthService.getCurrentUser()

    if (!user || !user.id) {
      router.push("/login")
      return
    }

    if (rating === 0) {
      setError("Por favor selecciona una calificación")
      return
    }

    if (!comment.trim()) {
      setError("Por favor escribe un comentario")
      return
    }

    setLoading(true)

    try {
      const payload = {
        productId,
        userId: user.id,
        rating,
        comment: comment.trim(),
      }

      console.log("📤 Enviando payload:", payload)

      await Database.createReview(payload)

      setRating(0)
      setComment("")
      onSuccess?.()
      router.refresh()
    } catch (err: any) {
      // quiero detener un 1segundo para el llamado
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.error("❌ Error creando review:", err)

      // mostrar más información del error del backend
      if (err?.message) console.error("message:", err.message)
      if (err?.response) console.error("response:", err.response)

      setError("Error al enviar la reseña. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escribe una Reseña</CardTitle>
        <CardDescription>Comparte tu experiencia con este trabajo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Calificación</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Tu Reseña</Label>
            <Textarea
              id="comment"
              placeholder="¿Qué te pareció este trabajo? ¿Cumplió tus expectativas?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Publicar Reseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
