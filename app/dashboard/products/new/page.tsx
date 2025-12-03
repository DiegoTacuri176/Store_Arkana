import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProductForm } from "@/components/product-form"
import { getServerAuth } from "@/lib/auth"

export default async function NewProductPage() {
  const user = await getServerAuth()

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Nuevo Trabajo</h1>
          <p className="text-muted-foreground">Publica tu trabajo creativo en el marketplace</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
           <DashboardNav userRole={user.role} />

          <div className="max-w-3xl">
            <ProductForm />
          </div>
        </div>
      </div>
    </div>
  )
}
