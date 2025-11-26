import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BlogComments } from "@/components/blog-comments"
import { Calendar, Eye, ArrowLeft } from "lucide-react"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  const postRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog/${slug}`, {
    cache: "no-store",
  })

  if (!postRes.ok) {
    notFound()
  }

  const post = await postRes.json()
  const tags = typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags || []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Blog
            </Link>
          </Button>

          <article>
            {post.cover_image && (
              <div className="mb-8 aspect-video overflow-hidden rounded-lg">
                <img
                  src={post.cover_image || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {post.category && <Badge variant="secondary">{post.category}</Badge>}
              {tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-heading text-4xl font-bold md:text-5xl text-balance">{post.title}</h1>

            <div className="mt-6 flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author_avatar || "/placeholder.svg"} />
                  <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author_name}</p>
                  {post.author_bio && <p className="text-sm text-muted-foreground">{post.author_bio}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} vistas</span>
                </div>
              </div>
            </div>

            <Card className="mt-8">
              <CardContent className="prose prose-gray max-w-none p-8 dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>
            </Card>
          </article>

          <div className="mt-12">
            <BlogComments postSlug={slug} comments={post.comments || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
