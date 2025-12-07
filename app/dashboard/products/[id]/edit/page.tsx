import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProductForm } from "@/components/product-form"
import { getServerAuth } from "@/lib/auth"
import type { Product } from "@/lib/types"

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getServerAuth()

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    redirect("/login")
  }

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const productRes = await fetch(`${API_URL}/api/products/${params.id}`, {
    cache: "no-store",
  })

  if (!productRes.ok) {
    notFound()
  }
  
  const productData = await productRes.json()

  // Mapear los datos de la base de datos al formato de Product
  const product: Product = {
    ...productData,
    images: typeof productData.images === "string" ? JSON.parse(productData.images) : productData.images,
    categoryId: productData.category_id,
    sellerId: productData.seller_id,
    createdAt: new Date(productData.created_at),
    updatedAt: new Date(productData.updated_at),
  }

  if (user.role !== 'admin' && product.seller_id !== user.id) {
    redirect("/dashboard/products")
  }


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Editar Trabajo</h1>
          <p className="text-muted-foreground">Modifica los detalles de tu trabajo publicado</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
           <DashboardNav userRole={user.role} />

          <div className="max-w-3xl">
            <ProductForm product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}