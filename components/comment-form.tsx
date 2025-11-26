"use client"
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthService } from "@/lib/auth"
import { Database } from "@/lib/db"

interface CommentFormProps {
  productId: string
  onSuccess?: () => void
}

export function CommentForm({ productId, onSuccess }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const user = AuthService.getCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (!content.trim()) return

    setLoading(true)

    try {
      await Database.createComment({
        productId,
        userId: user.id,
        content: content.trim(),
      })

      setContent("")
      onSuccess?.()
      router.refresh()
    } catch (err) {
            // quiero detener un 1segundo para el llamado
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.error("[v0] Error creating comment:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">
          <Button variant="link" className="p-0" onClick={() => router.push("/login")}>
            Inicia sesión
          </Button>{" "}
          para dejar un comentario
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Avatar>
        <AvatarImage src={user.avatar || "/placeholder.svg"} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          required
        />
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </form>
  )
}
