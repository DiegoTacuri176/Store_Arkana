import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Eye } from "lucide-react"

export default async function BlogPage() {
  const postsRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog?published=true`,
    {
      cache: "no-store",
    },
  )

  const posts = postsRes.ok ? await postsRes.json() : []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl text-balance">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Consejos, tutoriales y noticias para estudiantes creativos
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => {
              const tags = typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags || []

              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    {post.cover_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.cover_image || "/placeholder.svg"}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {post.category && <Badge variant="secondary">{post.category}</Badge>}
                        {tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="line-clamp-2 text-balance">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author_avatar || "/placeholder.svg"} />
                            <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {posts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No hay posts publicados aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
