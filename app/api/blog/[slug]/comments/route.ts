import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"

// POST /api/blog/[slug]/comments - Add comment to blog post
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json()
    const { user_id, content } = body

    if (!user_id || !content) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Get post ID from slug
    const [post] = await query("SELECT id FROM blog_posts WHERE slug = ?", [params.slug])

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    const id = uuidv4()

    await query("INSERT INTO blog_comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)", [
      id,
      post.id,
      user_id,
      content,
    ])

    const [comment] = await query(
      `SELECT bc.*, u.name as user_name, u.avatar as user_avatar
       FROM blog_comments bc
       LEFT JOIN users u ON bc.user_id = u.id
       WHERE bc.id = ?`,
      [id],
    )

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 })
  }
}
