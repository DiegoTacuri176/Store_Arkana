import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId es requerido" }, { status: 400 })
    }

    const comments = await query(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.product_id = ?
       ORDER BY c.created_at DESC`,
      [productId],
    )

    return NextResponse.json(comments)
  } catch (error: any) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, content } = body

    if (!productId || !userId || !content) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const commentId = uuidv4()

    await query(
      `INSERT INTO comments (id, product_id, user_id, content)
       VALUES (?, ?, ?, ?)`,
      [commentId, productId, userId, content],
    )

    const [comment] = await query("SELECT * FROM comments WHERE id = ?", [commentId])

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 })
  }
}
