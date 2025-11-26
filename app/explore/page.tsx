import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Database } from "@/lib/db"
import { SlidersHorizontal } from "lucide-react"

export default async function ExplorePage() {
  
  const products = await Database.getProducts({ status: "approved" })
  const categories = await Database.getCategories()

  const sellersMap = new Map<string, any>()
  for (const product of products) {
    
    if (!product?.sellerId) {
      console.warn("⚠️ Producto sin sellerId:", product)
      continue
    }

    if (!sellersMap.has(product.sellerId)) {
      const seller = await Database.getUser(product.sellerId)
      if (seller) sellersMap.set(product.sellerId, seller)
    }
  }

  return (
    <>
      <Header />
       <div className="min-h-screen bg-background px-5">

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Explorar Trabajos</h1>
          <p className="text-muted-foreground">
            Descubra trabajos creativos de estudiantes talentosos
          </p>
        </div>

        {/* ====================== FILTROS ====================== */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          {/* 🔹 Filtro por categoría */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 🔹 Filtro de orden */}
          <Select defaultValue="recent">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="popular">Más populares</SelectItem>
              <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Más Filtros
          </Button>
        </div>

        {/* ====================== PRODUCTOS ====================== */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                seller={sellersMap.get(product.sellerId)}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              No hay productos disponibles aún.
            </p>
          )}
        </div>

        {/* ====================== BOTÓN "CARGAR MÁS" ====================== */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Cargar Más
          </Button>
        </div>
      </div>
    </div>
    </>
  )
}
