import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getServerAuth } from "@/lib/auth"
import { PenSquare, Eye, Edit, Trash2 } from "lucide-react"

export default async function DashboardBlogPage() {
  const user = await getServerAuth()

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    redirect("/login")
  }

  const postsRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blog?author_id=${user.id}`,
    {
      cache: "no-store",
    },
  )

  const posts = postsRes.ok ? await postsRes.json() : []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Mis Posts</h1>
            <p className="text-muted-foreground">Gestiona tus publicaciones del blog</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/blog/new">
              <PenSquare className="mr-2 h-4 w-4" />
              Nuevo Post
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
           <DashboardNav userRole={user.role} />

          <Card>
            <CardHeader>
              <CardTitle>Publicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <div key={post.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "Publicado" : "Borrador"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views} vistas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/blog/${post.slug}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PenSquare className="h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 font-heading text-xl font-semibold">No tienes posts aún</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Crea tu primer post para compartir con la comunidad
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/dashboard/blog/new">Crear Post</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
