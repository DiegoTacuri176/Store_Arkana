import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Mail } from "lucide-react"

interface ProfilePageProps {
  // El nombre del parámetro debe coincidir con la carpeta [id]
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // 1. Esperamos a que params se resuelva y extraemos 'id'
  const { id } = await params

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // 2. Fetch de información del usuario usando 'id'
  const userRes = await fetch(`${API_URL}/api/users/${id}`, {
    cache: "no-store",
  })

  if (!userRes.ok) {
    notFound()
  }

  const user = await userRes.json()

  // 3. Si es vendedor, obtenemos sus productos y reseñas
  let products = []
  let reviews = []
  let avgRating = "0"
  
  if (user.role === "seller") {
    const [productsRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/api/products?sellerId=${id}&status=approved`, { cache: "no-store" }),
        fetch(`${API_URL}/api/reviews?sellerId=${id}`, { cache: "no-store" })
    ])

    products = productsRes.ok ? await productsRes.json() : []
    reviews = reviewsRes.ok ? await reviewsRes.json() : []

    if (reviews.length > 0) {
        const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
        avgRating = (sum / reviews.length).toFixed(1)
    }
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-4 md:px-6">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  <AvatarImage src={user.profile_picture_url || user.avatar || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>

                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h1 className="font-heading text-3xl font-bold">{user.name}</h1>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge className="capitalize" variant={user.role === 'seller' ? "default" : "secondary"}>
                        {user.role === "seller" ? "Vendedor" : user.role === 'admin' ? "Admin" : "Comprador"}
                      </Badge>
                      {user.role === "seller" && (
                        <Badge variant="outline" className="flex gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {avgRating} ({reviews.length} reseñas)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="max-w-md text-muted-foreground">{user.bio || "Sin biografía disponible."}</p>
                  
                  <div className="text-sm text-muted-foreground">
                    {(user.university || user.major) && (
                        <p className="mb-1 font-medium text-foreground">
                            {user.major} {user.university && `en ${user.university}`}
                        </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Se unió el {joinDate}</span>
                    </div>
                    {user.role === "seller" && (
                      <div className="flex items-center gap-1">
                        <span>• {products.length} trabajos publicados</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`mailto:${user.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contactar
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid (Solo vendedores) */}
        {user.role === "seller" && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Trabajos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Calificación Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">{avgRating}</div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Reseñas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reviews.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Section */}
        {user.role === "seller" && (
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold">
              Portafolio de {user.name.split(' ')[0]}
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
                    // Pasamos el objeto seller completo para evitar llamadas extra en el ProductCard
                    seller={{
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar || user.profile_picture_url
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Este vendedor aún no ha publicado trabajos.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}