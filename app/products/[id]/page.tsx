import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"
import { CommentForm } from "@/components/comment-form"
import { CommentList } from "@/components/comment-list"
import { Star, Eye, Heart, Share2 } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
// IMPORTS ADICIONALES PARA LA NUEVA IMPLEMENTACIÓN
import { Toaster } from "react-hot-toast"
import { ProductActions } from "@/components/products-actions" 

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const productPromise = fetch(`${API_URL}/api/products/${id}`, { cache: "no-store" })
  const reviewsPromise = fetch(`${API_URL}/api/reviews?productId=${id}`, { cache: "no-store" })
  const commentsPromise = fetch(`${API_URL}/api/comments?productId=${id}`, { cache: "no-store" })

  const productRes = await productPromise

  if (!productRes.ok) {
    notFound()
  }

  const productData = await productRes.json()

  // Procesamos datos del producto
  const product = {
    ...productData,
    images: typeof productData.images === "string" ? JSON.parse(productData.images) : productData.images,
    sellerId: productData.seller_id,
    categoryId: productData.category_id,
  }

  const seller = {
    id: productData.seller_id,
    name: productData.seller_name,
    avatar: productData.seller_avatar,
    bio: productData.seller_bio,
  }

  const category = productData.category_name
    ? {
        id: productData.category_id,
        name: productData.category_name,
        slug: productData.category_slug,
      }
    : null

  // 3. Disparamos la petición de relacionados (ahora que tenemos la categoría)
  // Y esperamos a que reviews y comments terminen también.
  const relatedPromise = fetch(
    `${API_URL}/api/products?category=${category?.slug}&status=approved`, 
    { cache: "no-store" }
  )

  // 4. Esperamos todas las peticiones secundarias juntas
  const [reviewsRes, commentsRes, relatedRes] = await Promise.all([
    reviewsPromise,
    commentsPromise,
    relatedPromise
  ])

  // Convertimos a JSON en paralelo
  const [reviews, comments, relatedProducts] = await Promise.all([
    reviewsRes.json(),
    commentsRes.json(),
    relatedRes.json()
  ])

  // Lógica de filtrado y mapeo
  const filteredRelated = relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 4)

  const usersMap = new Map()
  
  // Función helper para llenar el mapa (evita código duplicado)
  const addToMap = (item: any) => {
    if (item.user_name && !usersMap.has(item.user_id)) {
      usersMap.set(item.user_id, {
        id: item.user_id,
        name: item.user_name,
        avatar: item.user_avatar,
      })
    }
  }

  reviews.forEach(addToMap)
  comments.forEach(addToMap)

  const avgRating = productData.avg_rating || 0
  const reviewCount = productData.review_count || 0

  return (
    <div className="min-h-screen bg-background ">
      <Header />

      <div className="container py-8 px-5">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-foreground">
            Explorar
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority // Esto es muy importante para LCP
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.featured && <Badge className="absolute left-4 top-4">Destacado</Badge>}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} - ${index + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-3xl font-bold text-balance">{product.title}</h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{Number(avgRating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviewCount} reseñas)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{product.views} vistas</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold">${product.price}</span>
                <span className="text-muted-foreground">USD</span>
              </div>
            </div>

            {/* Actions: AÑADIDO ProductActions Component */}
            <div className="flex gap-3">
              <AddToCartButton product={product} className="flex-1" />
              {/* Componente que maneja el estado de Favorito y la acción de Compartir */}
              <ProductActions productId={product.id} isFavoritedInitially={false} />
            </div>

            {/* Seller Info */}
            {seller && (
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <Link href={`/profile/${productData.seller_id}`} className="hover:opacity-80 transition-opacity">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={seller.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{seller.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${productData.seller_id}`} className="hover:underline">
                      <p className="font-semibold">{seller.name}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground">{seller.bio || "Estudiante creativo"}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${productData.seller_id}`}>Ver Perfil</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-semibold">Descripción</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Category */}
            {category && (
              <div>
                <h3 className="font-semibold">Categoría</h3>
                <Link href={`/categories/${category.slug}`}>
                  <Badge variant="secondary" className="mt-2">
                    {category.name}
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Reviews and Comments Section */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList>
              <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
              <TabsTrigger value="comments">Comentarios ({comments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews" className="mt-6 space-y-6">
              <ReviewForm productId={product.id} />
              <ReviewList
                reviews={reviews.map((r: any) => ({
                  ...r,
                  userId: r.user_id,
                  productId: r.product_id,
                  createdAt: r.created_at,
                }))}
                users={usersMap}
              />
            </TabsContent>
            
            <TabsContent value="comments" className="mt-6 space-y-6">
              <CommentForm productId={product.id} />
              <CommentList
                comments={comments.map((c: any) => ({
                  ...c,
                  userId: c.user_id,
                  productId: c.product_id,
                  createdAt: c.created_at,
                }))}
                users={usersMap}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 font-heading text-2xl font-bold">Trabajos Relacionados</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredRelated.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    ...relatedProduct,
                    images:
                      typeof relatedProduct.images === "string"
                        ? JSON.parse(relatedProduct.images)
                        : relatedProduct.images,
                    sellerId: relatedProduct.seller_id,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Toaster de react-hot-toast para notificaciones */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}