import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getServerAuth } from "@/lib/auth"
import { ShoppingBag, Eye, ImageIcon } from "lucide-react"

// 1. INTERFACES ACTUALIZADAS (Según tus datos reales)
interface OrderItem {
  id: string
  product_id: string
  seller_id: string
  quantity: number
  price: string // Viene como string '4.99'
  product_title: string // CAMBIO IMPORTANTE: antes era 'name'
  product_images: string[] // Array de URLs
  seller_name: string
}

interface Order {
  id: string
  buyer_id: string
  total: string // Viene como string '4.99'
  status: string
  created_at: string
  buyer_name: string
  items: OrderItem[]
  // Campos opcionales
  seller_name?: string 
}

export default async function OrdersPage() {
  const user = await getServerAuth()

  if (!user) {
    redirect("/login")
  }

  const ordersRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/orders?${
      user.role === "seller" ? `sellerId=${user.id}` : `buyerId=${user.id}`
    }`,
    {
      cache: "no-store",
    },
  )

  const orders: Order[] = ordersRes.ok ? await ordersRes.json() : []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">
            {user.role === "seller" ? "Pedidos Recibidos" : "Mis Pedidos"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "seller"
              ? "Gestiona los pedidos de tus trabajos"
              : "Revisa el estado de tus compras"}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DashboardNav userRole={user.role} />

          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const orderDate = new Date(order.created_at)

                    // Filtrar items: Si soy vendedor, solo veo mis productos. Si soy comprador, veo todo.
                    const displayItems =
                      user.role === "seller"
                        ? order.items?.filter((item) => item.seller_id === user.id) || []
                        : order.items || []

                    // Si no hay items para mostrar (caso raro), saltamos
                    if (displayItems.length === 0) return null;

                    // Calcular total basado en los items visibles
                    const displayTotal =
                      user.role === "seller"
                        ? displayItems.reduce(
                            (sum, item) => sum + Number(item.price) * item.quantity,
                            0
                          )
                        : Number(order.total)

                    // Obtenemos la imagen del primer producto para mostrarla de portada
                    const firstImage = displayItems[0]?.product_images?.[0] || null

                    return (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                      >
                        {/* 2. MOSTRAR IMAGEN DEL PRODUCTO */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                          {firstImage ? (
                            <img 
                              src={firstImage} 
                              alt="Product thumbnail" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">
                              Pedido #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <Badge
                              variant={
                                order.status === "completed" ? "default" : "secondary"
                              }
                              className={
                                order.status === "completed"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : order.status === "pending"
                                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                  : ""
                              }
                            >
                              {order.status === "pending" ? "Pendiente" : order.status}
                            </Badge>
                          </div>
                          
                          {/* 3. MOSTRAR TÍTULO CORRECTO */}
                          <p className="text-sm font-medium text-foreground">
                            {displayItems[0].product_title}
                            {displayItems.length > 1 && 
                              <span className="text-muted-foreground ml-1">
                                y {displayItems.length - 1} más...
                              </span>
                            }
                          </p>

                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <span>{orderDate.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>
                              {user.role === "seller"
                                ? `Comprador: ${order.buyer_name}`
                                : `Vendedor: ${displayItems[0].seller_name}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              ${displayTotal.toFixed(2)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            {/* Ajusta esta ruta según tu estructura de carpetas */}
                            <Link href={`/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Detalles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">
                    {user.role === "seller" ? "Sin pedidos aún" : "No has comprado nada"}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {user.role === "seller"
                      ? "Tus productos aparecerán aquí cuando alguien compre."
                      : "¡Explora el catálogo y realiza tu primera compra!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}