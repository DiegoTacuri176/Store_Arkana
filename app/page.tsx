import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { SeccionPageLayout } from "@/components/Seccion-Page-Layout"
import { getServerAuth } from "@/lib/auth"

export default async function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  
  const [featuredProductsRes, allProductsRes, categoriesRes] = await Promise.all([
    fetch(`${API_URL}/api/products?featured=true&status=approved`, { cache: "no-store" }),
    fetch(`${API_URL}/api/products?status=approved`, { cache: "no-store" }),
    fetch(`${API_URL}/api/categories`, { cache: "no-store" }),
  ])
  const user = await getServerAuth()

  const featuredProducts = featuredProductsRes.ok ? await featuredProductsRes.json() : []
  const allProducts = allProductsRes.ok ? await allProductsRes.json() : []
  const categoriesData = categoriesRes.ok ? await categoriesRes.json() : []

  const categories = Array.isArray(categoriesData) ? categoriesData : []

  return (
    <div className="min-h-screen bg-background w-full flex flex-col items-center">
      <Header />

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Plataforma para Estudiantes Creativos
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Descubre y Compra Trabajos Creativos de <span className="text-primary">Estudiantes Talentosos</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              Una plataforma donde estudiantes pueden exponer y vender sus trabajos de diseño, ilustración, desarrollo y
              más. Apoya el talento emergente.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/explore">
                  Explorar Trabajos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {
                user!.role !== "buyer" && (

              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard/products/new">Vender tu Trabajo</Link>
              </Button>
                )
              }
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t pt-8">
              <div>
                <div className="font-heading text-3xl font-bold">{allProducts.length}+</div>
                <div className="text-sm text-muted-foreground">Trabajos</div>
              </div>
              <div>
                <div className="font-heading text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Estudiantes</div>
              </div>
              <div>
                <div className="font-heading text-3xl font-bold">4.9</div>
                <div className="text-sm text-muted-foreground">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-b py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">Explora por Categoría</h2>
              <p className="mt-2 text-muted-foreground">Encuentra el trabajo perfecto para tu proyecto</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/categories">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length > 0 ? (
              categories
                .slice(0, 6)
                .map((category: any) => (
                  <CategoryCard key={category.id} category={category} productCount={category.product_count || 0} />
                ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No hay categorías disponibles. Un administrador debe crear categorías primero.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">Trabajos Destacados</h2>
              <p className="mt-2 text-muted-foreground">Los mejores trabajos seleccionados por nuestro equipo</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/explore">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
                    sellerId: product.seller_id,
                  }}
                  seller={{
                    id: product.seller_id,
                    name: product.seller_name,
                    avatar: product.seller_avatar,
                  }}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No hay trabajos destacados disponibles aún.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold">¿Por qué AR Arkana?</h2>
            <p className="mt-2 text-muted-foreground">La mejor plataforma para estudiantes creativos</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Impulsa tu Carrera</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Construye tu portafolio y gana experiencia vendiendo tus trabajos creativos
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Pagos Seguros</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Transacciones protegidas y pagos garantizados para compradores y vendedores
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-heading font-semibold">Talento Único</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Accede a trabajos creativos únicos hechos por estudiantes talentosos
              </p>
            </div>
          </div>
        </div>
      </section>

      <SeccionPageLayout />
      
    </div>
  )
}
