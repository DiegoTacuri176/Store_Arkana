import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/lib/db"
import { getServerAuth } from "@/lib/auth"
import { Users, Package, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"

export default async function AdminPage() {
  const user = await getServerAuth()

  if (!user || user.role !== "admin") {
    redirect("/login")
  }

  const [allProducts, allUsers] = await Promise.all([
    Database.getProducts(),
    Database.getUsers?.() || Promise.resolve([]),
  ])

  const pendingProducts = allProducts.filter((p) => p.status === "pending")
  const approvedProducts = allProducts.filter((p) => p.status === "approved")
  const rejectedProducts = allProducts.filter((p) => p.status === "rejected")

  const totalRevenue = approvedProducts.length * 150
  const monthlyGrowth = 12.5

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona la plataforma Student Market</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allUsers.length}</div>
                  <p className="text-xs text-muted-foreground">+8 este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trabajos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allProducts.length}</div>
                  <p className="text-xs text-muted-foreground">{approvedProducts.length} aprobados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{monthlyGrowth}% este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingProducts.length}</div>
                  <p className="text-xs text-muted-foreground">Requieren revisión</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedProducts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingProducts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedProducts.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.status === "pending" && "Pendiente de revisión"}
                          {product.status === "approved" && "Aprobado"}
                          {product.status === "rejected" && "Rechazado"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : "Sin fecha"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
