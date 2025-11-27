import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerAuth } from "@/lib/auth"
import { ShoppingBag } from "lucide-react"

export default async function AdminOrdersPage() {
  const user = await getServerAuth()

  if (!user || user.role !== "admin") {
    redirect("/login")
  }

  const orders = []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">Administra todas las transacciones de la plataforma</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <Card>
            <CardHeader>
              <CardTitle>Todos los Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">{/* Orders list will go here */}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 font-heading text-xl font-semibold">No hay pedidos aún</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Los pedidos de la plataforma aparecerán aquí</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
