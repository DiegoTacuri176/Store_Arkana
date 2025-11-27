import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database } from "@/lib/db"
import { getServerAuth } from "@/lib/auth"
import { Package, DollarSign, Eye, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"

export default async function DashboardPage() {
  const user = await getServerAuth()

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    redirect("/login")
  }

  const myProducts = await Database.getProducts({ sellerId: user.id })
  const approvedProducts = myProducts.filter((p) => p.status === "approved")
  const pendingProducts = myProducts.filter((p) => p.status === "pending")

  // Calculate stats
  const totalViews = myProducts.reduce((sum, p) => sum + p.views, 0)
  const totalRevenue = approvedProducts.length * 150

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Mi Dashboard</h1>
            <p className="text-muted-foreground">Gestiona tus trabajos y ventas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trabajo
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trabajos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myProducts.length}</div>
                  <p className="text-xs text-muted-foreground">{approvedProducts.length} aprobados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">+12% este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">En todos tus trabajos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingProducts.length}</div>
                  <p className="text-xs text-muted-foreground">En revisión</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Trabajos Recientes</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/products">Ver todos</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {myProducts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {myProducts.slice(0, 3).map((product) => (
                      <ProductCard key={product.id} product={product} seller={user} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No tienes trabajos aún</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Comienza publicando tu primer trabajo</p>
                    <Button className="mt-4" asChild>
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
    </div>
  )
}
