import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getServerAuth } from "@/lib/auth"
import { ShoppingBag, Eye } from "lucide-react"

export default async function OrdersPage() {
  const user = await getServerAuth()

  if (!user) {
    redirect("/login")
  }

  const ordersRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/orders?${user.role === "seller" ? `sellerId=${user.id}` : `buyerId=${user.id}`}`,
    {
      cache: "no-store",
    },
  )

  const orders = ordersRes.ok ? await ordersRes.json() : []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">
            {user.role === "seller" ? "Pedidos Recibidos" : "Mis Pedidos"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "seller" ? "Gestiona los pedidos de tus trabajos" : "Revisa el estado de tus compras"}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => {
                    const orderDate = new Date(order.created_at)
                    const displayItems =
                      user.role === "seller"
                        ? order.items?.filter((item: any) => item.seller_id === user.id) || []
                        : order.items || []
                    const displayTotal =
                      user.role === "seller"
                        ? displayItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
                        : order.total

                    return (
                      <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                            <Badge
                              className={
                                order.status === "completed"
                                  ? "bg-green-500"
                                  : order.status === "processing"
                                    ? "bg-blue-500"
                                    : order.status === "cancelled"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                              }
                            >
                              {order.status === "completed"
                                ? "Completado"
                                : order.status === "processing"
                                  ? "Procesando"
                                  : order.status === "cancelled"
                                    ? "Cancelado"
                                    : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {orderDate.toLocaleDateString()} • {displayItems.length} artículo(s)
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {user.role === "seller"
                              ? `Cliente: ${order.buyer_name}`
                              : `Vendedor: ${order.seller_name || "Varios"}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-heading text-lg font-bold">${displayTotal.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.role === "seller" ? "Tu ganancia" : "Total pagado"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
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
                  <h3 className="mt-4 font-heading text-xl font-semibold">
                    {user.role === "seller" ? "No tienes pedidos aún" : "No has realizado compras aún"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {user.role === "seller"
                      ? "Los pedidos de tus trabajos aparecerán aquí"
                      : "Explora el marketplace y encuentra trabajos creativos"}
                  </p>
                  {user.role !== "seller" && (
                    <Button className="mt-4" asChild>
                      <Link href="/explore">Explorar Trabajos</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
