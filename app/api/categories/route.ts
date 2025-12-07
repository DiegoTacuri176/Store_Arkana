import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
       GROUP BY c.id
       ORDER BY c.name ASC`,
    )

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 })
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const cookieStore = await cookies()
    
    // CORRECCIÓN: Usar "marketplace_current_user" en lugar de "auth_user"
    const authCookie = cookieStore.get("marketplace_current_user")

    if (!authCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const user = JSON.parse(authCookie.value)

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden crear categorías" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, slug, description, icon, image_url } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const categoryId = uuidv4()

    await query(
      `INSERT INTO categories (id, name, slug, description, icon, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [categoryId, name, slug, description, icon, image_url || null],
    )

    const [category] = await query("SELECT * FROM categories WHERE id = ?", [categoryId])

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating category:", error)
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 })
  }
}