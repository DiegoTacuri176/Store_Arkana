import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Review, User } from "@/lib/types"

interface ReviewListProps {
  reviews: Review[]
  users: Map<string, User>
}

export function ReviewList({ reviews, users }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Aún no hay reseñas para este trabajo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const user = users.get(review.userId)

        return (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Envolvemos el Avatar en un Link */}
                <Link href={`/profile/${review.userId}`} className="transition-opacity hover:opacity-80">
                    <Avatar>
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                </Link>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* Hacemos el nombre también clicable */}
                      <Link href={`/profile/${review.userId}`} className="font-semibold hover:underline decoration-primary">
                        {user?.name || "Usuario"}
                      </Link>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}