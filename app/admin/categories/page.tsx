import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { getServerAuth } from "@/lib/auth"
import { query } from "@/lib/server/mysql"
import { CategoryManager } from "@/components/category-manager"

export default async function AdminCategoriesPage() {
  const user = await getServerAuth()

  if (!user || user.role !== "admin") {
    redirect("/login")
  }

  // CORRECCIÓN: Agregamos "AND p.status = 'approved'" para contar solo los aprobados
  const categories = await query(
    `SELECT c.*, COUNT(p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
     GROUP BY c.id
     ORDER BY c.name ASC`,
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-muted-foreground">Administra las categorías de trabajos</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <div>
            <CategoryManager initialCategories={categories} />
          </div>
        </div>
      </div>
    </div>
  )
}