import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Comment, User } from "@/lib/types"

interface CommentListProps {
  comments: Comment[]
  users: Map<string, User>
}

export function CommentList({ comments, users }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Aún no hay comentarios</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const user = users.get(comment.userId)

        return (
          <div
            key={comment.id}
            className="flex gap-4 p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:bg-accent/40 transition-colors"
          >
            {/* Envolvemos el Avatar en un Link */}
            <Link href={`/profile/${comment.userId}`} className="shrink-0 transition-opacity hover:opacity-80">
                <Avatar className="h-10 w-10 border">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Hacemos el nombre también clicable */}
                  <Link href={`/profile/${comment.userId}`} className="font-semibold text-sm hover:underline decoration-primary">
                    {user?.name || "Usuario"}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}