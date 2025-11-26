import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"
import { Database } from "@/lib/db" 

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const sellerId = searchParams.get("sellerId")
    const featured = searchParams.get("featured")

    let sql = `
      SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, c.name as category_name,
      (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    if (category) {
      sql += " AND c.slug = ?"
      params.push(category)
    }

    if (status) {
      sql += " AND p.status = ?"
      params.push(status)
    }

    if (sellerId) {
      sql += " AND p.seller_id = ?"
      params.push(sellerId)
    }

    if (featured === "true") {
      sql += " AND p.featured = TRUE"
    }

    sql += " ORDER BY p.created_at DESC"

    const products = await query(sql, params)

    return NextResponse.json(products)
  } catch (error: any) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, categoryId, title, description, price, images } = body

    if (!sellerId || !title || !price) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // 💡 SOLUCIÓN AL ERROR DE CLAVE FORÁNEA:
    // 1. Verificar si el sellerId existe en la tabla users
    const seller = await Database.getUser(sellerId)

    if (!seller) {
      // 2. Si no existe, devuelve un error 401 (no autorizado/inválido)
      return NextResponse.json(
        { error: "Vendedor no encontrado o ID de sesión inválido. Por favor, inicia sesión de nuevo." }, 
        { status: 401 }
      )
    }
    // FIN SOLUCIÓN

    const productId = uuidv4()

    await query(
      `INSERT INTO products (id, seller_id, category_id, title, description, price, images, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [productId, sellerId, categoryId, title, description, price, JSON.stringify(images || [])],
    )

    const [product] = await query("SELECT * FROM products WHERE id = ?", [productId])

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}