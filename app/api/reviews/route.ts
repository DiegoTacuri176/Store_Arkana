import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"

// GET /api/reviews - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")
    const sellerId = searchParams.get("sellerId")

    if (!productId && !sellerId) {
      return NextResponse.json({ error: "productId o sellerId es requerido" }, { status: 400 })
    }

    let sql = `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (productId) {
      sql += " AND r.product_id = ?"
      params.push(productId)
    }

    if (sellerId) {
      sql += " AND r.product_id IN (SELECT id FROM products WHERE seller_id = ?)"
      params.push(sellerId)
    }

    sql += " ORDER BY r.created_at DESC"

    const reviews = await query(sql, params)

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error("[v0] Error fetching reviews:", error)
    return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 })
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, rating, comment } = body

    if (!productId || !userId || !rating) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const reviewId = uuidv4()

    await query(
      `INSERT INTO reviews (id, product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [reviewId, productId, userId, rating, comment],
    )

    const [review] = await query("SELECT * FROM reviews WHERE id = ?", [reviewId])

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating review:", error)
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 })
  }
}