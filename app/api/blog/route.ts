import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const published = searchParams.get("published")

    let sql = `
      SELECT bp.*, u.name as author_name, u.avatar as author_avatar
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
    `
    const params: any[] = []

    const conditions: string[] = []
    if (category) {
      conditions.push("bp.category = ?")
      params.push(category)
    }
    if (published !== null) {
      conditions.push("bp.published = ?")
      params.push(published === "true" ? 1 : 0)
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY bp.created_at DESC"

    const posts = await query(sql, params)
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error("[v0] Error fetching blog posts:", error)
    return NextResponse.json({ error: "Error al obtener posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, cover_image, author_id, category, tags, published } = body

    if (!title || !slug || !content || !author_id) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    const id = uuidv4()

    await query(
      `INSERT INTO blog_posts (id, title, slug, excerpt, content, cover_image, author_id, category, tags, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, slug, excerpt, content, cover_image, author_id, category, JSON.stringify(tags || []), published || 0],
    )

    const [post] = await query("SELECT * FROM blog_posts WHERE id = ?", [id])
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating blog post:", error)
    return NextResponse.json({ error: "Error al crear post" }, { status: 500 })
  }
}
