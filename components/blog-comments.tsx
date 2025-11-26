"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"

interface Comment {
  id: string
  content: string
  user_name: string
  user_avatar: string
  created_at: string
}

interface BlogCommentsProps {
  postSlug: string
  comments: Comment[]
}

export function BlogComments({ postSlug, comments: initialComments }: BlogCommentsProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setLoading(true)

    try {
      // In a real app, get user_id from auth context
      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "mock-user-id", // Replace with actual user ID
          content: newComment,
        }),
      })

      if (!res.ok) throw new Error("Error posting comment")

      const comment = await res.json()
      setComments([comment, ...comments])
      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error posting comment:", error)
      alert("Error al publicar comentario. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? "Publicando..." : "Publicar Comentario"}
          </Button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-lg border p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user_avatar || "/placeholder.svg"} />
                <AvatarFallback>{comment.user_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{comment.user_name}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No hay comentarios aún. Sé el primero en comentar.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
