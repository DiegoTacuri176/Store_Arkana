import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const [post] = await query(
      `SELECT bp.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ?`,
      [params.slug],
    )

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    await query("UPDATE blog_posts SET views = views + 1 WHERE slug = ?", [params.slug])

    const comments = await query(
      `SELECT bc.*, u.name as user_name, u.avatar as user_avatar
       FROM blog_comments bc
       LEFT JOIN users u ON bc.user_id = u.id
       WHERE bc.post_id = ?
       ORDER BY bc.created_at DESC`,
      [post.id],
    )

    return NextResponse.json({ ...post, comments })
  } catch (error: any) {
    console.error("[v0] Error fetching blog post:", error)
    return NextResponse.json({ error: "Error al obtener post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json()
    const { title, excerpt, content, cover_image, category, tags, published } = body

    const updates: string[] = []
    const values: any[] = []

    if (title) {
      updates.push("title = ?")
      values.push(title)
    }
    if (excerpt !== undefined) {
      updates.push("excerpt = ?")
      values.push(excerpt)
    }
    if (content) {
      updates.push("content = ?")
      values.push(content)
    }
    if (cover_image) {
      updates.push("cover_image = ?")
      values.push(cover_image)
    }
    if (category) {
      updates.push("category = ?")
      values.push(category)
    }
    if (tags) {
      updates.push("tags = ?")
      values.push(JSON.stringify(tags))
    }
    if (published !== undefined) {
      updates.push("published = ?")
      values.push(published ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(params.slug)

    await query(`UPDATE blog_posts SET ${updates.join(", ")} WHERE slug = ?`, values)

    const [post] = await query("SELECT * FROM blog_posts WHERE slug = ?", [params.slug])
    return NextResponse.json(post)
  } catch (error: any) {
    console.error("[v0] Error updating blog post:", error)
    return NextResponse.json({ error: "Error al actualizar post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await query("DELETE FROM blog_posts WHERE slug = ?", [params.slug])
    return NextResponse.json({ message: "Post eliminado" })
  } catch (error: any) {
    console.error("[v0] Error deleting blog post:", error)
    return NextResponse.json({ error: "Error al eliminar post" }, { status: 500 })
  }
}
