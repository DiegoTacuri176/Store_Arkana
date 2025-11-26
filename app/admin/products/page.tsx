'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Database } from "@/lib/db"
import { AuthService } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { Eye, CheckCircle, XCircle } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()

    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const allProducts = await Database.getProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }


  const handleApprove = async (productId: string) => {
    await Database.updateProduct(productId, { status: "approved" })
    loadProducts()
  }

  const handleReject = async (productId: string) => {
    await Database.updateProduct(productId, { status: "rejected" })
    loadProducts()
  }

  const pendingProducts = products.filter((p) => p.status === "pending")
  const approvedProducts = products.filter((p) => p.status === "approved")
  const rejectedProducts = products.filter((p) => p.status === "rejected")

  const ProductTable = ({ products }: { products: Product[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Imagen</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="w-[200px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{product.title}</TableCell>
            <TableCell>{product.sellerName ?? "Desconocido"}</TableCell>
            <TableCell>${product.price}</TableCell>
            <TableCell>
              {product.status === "approved" && (
                <Badge className="bg-green-500">Aprobado</Badge>
              )}
              {product.status === "pending" && (
                <Badge variant="secondary">Pendiente</Badge>
              )}
              {product.status === "rejected" && (
                <Badge variant="destructive">Rechazado</Badge>
              )}
            </TableCell>
            <TableCell>
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${product.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {product.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(product.id)}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(product.id)}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">
            Gestión de Trabajos
          </h1>
          <p className="text-muted-foreground">
            Revisa y gestiona todos los trabajos publicados
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Pendientes ({pendingProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Aprobados ({approvedProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rechazados ({rejectedProducts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  {pendingProducts.length > 0 ? (
                    <ProductTable products={pendingProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos pendientes de revisión
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved">
                  {approvedProducts.length > 0 ? (
                    <ProductTable products={approvedProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos aprobados
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rejected">
                  {rejectedProducts.length > 0 ? (
                    <ProductTable products={rejectedProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos rechazados
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
