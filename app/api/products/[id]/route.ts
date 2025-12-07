import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

// Definimos el tipo para los props (para reutilizarlo)
type Props = {
  params: Promise<{ id: string }>
}

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: Props) {
  try {
    // PASO CRUCIAL: Esperar a que params se resuelva
    const { id } = await params 

    const [product] = await query(
      `SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.bio as seller_bio,
       c.name as category_name, c.slug as category_slug,
       (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id], // Usamos la variable 'id' extraída
    )

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Increment views
    await query("UPDATE products SET views = views + 1 WHERE id = ?", [id])

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    // PASO CRUCIAL: Esperar a que params se resuelva
    const { id } = await params

    const body = await request.json()
    const { title, description, price, images, categoryId, status } = body

    const updates: string[] = []
    const values: any[] = []

    if (title) {
      updates.push("title = ?")
      values.push(title)
    }
    if (description !== undefined) {
      updates.push("description = ?")
      values.push(description)
    }
    if (price) {
      updates.push("price = ?")
      values.push(price)
    }
    if (images) {
      updates.push("images = ?")
      values.push(JSON.stringify(images))
    }
    if (categoryId) {
      updates.push("category_id = ?")
      values.push(categoryId)
    }
    if (status) {
      updates.push("status = ?")
      values.push(status)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(id) // Usamos 'id' extraído

    await query(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`, values)

    const [product] = await query("SELECT * FROM products WHERE id = ?", [id])

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    // PASO CRUCIAL: Esperar a que params se resuelva
    const { id } = await params

    await query("DELETE FROM products WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting product:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}