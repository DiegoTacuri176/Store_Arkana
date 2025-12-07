'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database } from "@/lib/db"
import { AuthService } from "@/lib/auth"
import type { Product, User } from "@/lib/types"
import { Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { Package } from "lucide-react"

interface ProductWithSellerName extends Product {
    sellerName?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithSellerName[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const loadProducts = useCallback(async (userId: string) => {
    try {
      const myProducts = await Database.getProducts({ sellerId: userId })
      setProducts(myProducts)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()

    if (!currentUser || (currentUser.role !== "seller" && currentUser.role !== "admin")) {
      router.replace("/login")
      return
    }
    setUser(currentUser)
    loadProducts(currentUser.id)
  }, [router, loadProducts])


  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajo? Esta acción es irreversible.")) {
      return
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Error deleting product")

      setProducts(products.filter(p => p.id !== productId))
      alert("Trabajo eliminado exitosamente.")

    } catch (error) {
      console.error("Error eliminando producto:", error)
      alert("Error al eliminar el trabajo. Intenta de nuevo.")
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprobado</Badge>
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <p className="text-lg text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Mis Trabajos</h1>
            <p className="text-muted-foreground">Gestiona todos tus trabajos publicados</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trabajo
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
           <DashboardNav userRole={user.role} />

          <Card>
            {/* CORRECCIÓN: Si hay productos, el contenido tiene padding-0. Si no hay, el div interno 
               (flex items-center justify-center) debe tener un padding para centrar el mensaje. */}
            <CardContent className="p-0">
              {products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagen</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vistas</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
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
                        <TableCell>
                          <Badge variant="outline">Categoría</Badge>
                        </TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>{product.views}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 font-heading text-xl font-semibold">No tienes trabajos aún</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Comienza publicando tu primer trabajo creativo</p>
                  <Button className="mt-6" asChild>
                    <Link href="/dashboard/products/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Trabajo
                    </Link>
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