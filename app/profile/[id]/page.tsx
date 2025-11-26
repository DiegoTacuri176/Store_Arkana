import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar } from "lucide-react"

interface ProfilePageProps {
  params: Promise<{ userId: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params

  // Fetch user information
  const userRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/users/${userId}`, {
    cache: "no-store",
  })

  if (!userRes.ok) {
    notFound()
  }

  const user = await userRes.json()

  // Fetch user's products
  const productsRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products?sellerId=${userId}&status=approved`,
    {
      cache: "no-store",
    },
  )
  const products = await productsRes.json()

  // Fetch user reviews/ratings
  const reviewsRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reviews?sellerId=${userId}`,
    {
      cache: "no-store",
    },
  )
  const reviews = await reviewsRes.json()

  const avgRating =
    reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  const totalReviews = reviews.length

  const joinDate = new Date(user.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile_picture_url || user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div>
                    <h1 className="font-heading text-3xl font-bold">{user.name}</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="capitalize">{user.role === "seller" ? "Vendedor" : "Comprador"}</Badge>
                      {user.role === "seller" && (
                        <Badge variant="secondary">
                          <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {Number(avgRating).toFixed(1)} ({totalReviews})
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="max-w-md text-muted-foreground">{user.bio || "Estudiante creativo de la plataforma"}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Se unió el {joinDate}</span>
                    </div>
                    {user.role === "seller" && products.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>{products.length} trabajos publicados</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user.role === "seller" && (
                <Button className="w-full sm:w-auto">
                  <Link href={`mailto:${user.email}`}>Contactar</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {user.role === "seller" && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trabajos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Calificación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{Number(avgRating).toFixed(1)}</div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reseñas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalReviews}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Section */}
        {user.role === "seller" && (
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold">
              {products.length === 0 ? "Sin trabajos publicados" : "Trabajos del Vendedor"}
            </h2>

            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      images: typeof product.images === "string" ? JSON.parse(product.images) : product.images || [],
                      sellerId: product.seller_id,
                      categoryId: product.category_id,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Este vendedor aún no ha publicado trabajos</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Buyer Info */}
        {user.role === "buyer" && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Este usuario es un comprador en la plataforma</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}