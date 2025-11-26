import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { cookies } from "next/headers"

// GET /api/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [category] = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
       WHERE c.id = ?
       GROUP BY c.id`,
      [params.id],
    )

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("[v0] Error fetching category:", error)
    return NextResponse.json({ error: "Error al obtener categoría" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth_user")

    if (!authCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const user = JSON.parse(authCookie.value)

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden editar categorías" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, slug, description, icon, image_url } = body

    await query(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, icon = ?, image_url = ?
       WHERE id = ?`,
      [name, slug, description, icon, image_url || null, params.id],
    )

    const [category] = await query("SELECT * FROM categories WHERE id = ?", [params.id])

    return NextResponse.json(category)
  } catch (error: any) {
    console.error("[v0] Error updating category:", error)
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth_user")

    if (!authCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const user = JSON.parse(authCookie.value)

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden eliminar categorías" },
        { status: 403 },
      )
    }

    // Check if category has products
    const products = await query("SELECT COUNT(*) as count FROM products WHERE category_id = ?", [params.id])

    if (products[0].count > 0) {
      return NextResponse.json({ error: "No se puede eliminar una categoría con productos asociados" }, { status: 400 })
    }

    await query("DELETE FROM categories WHERE id = ?", [params.id])

    return NextResponse.json({ message: "Categoría eliminada exitosamente" })
  } catch (error: any) {
    console.error("[v0] Error deleting category:", error)
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 })
  }
}