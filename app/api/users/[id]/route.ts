import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { hashPassword } from "@/lib/password"

// 1. CORRECCIÓN: Definir params como una Promesa
type Props = {
  params: Promise<{ id: string }>
}

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params

    const [user] = await query(
      `SELECT id, email, name, role, avatar, bio, university, major, created_at
       FROM users WHERE id = ?`,
      [id],
    )

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      createdAt: user.created_at,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    // 3. CORRECCIÓN: Esperar (await) a que params se resuelva aquí también
    const { id } = await params
    
    const body = await request.json()
    const { name, bio, avatar, university, major, password } = body 

    const updates: string[] = []
    const values: any[] = []

    if (name) {
      updates.push("name = ?")
      values.push(name)
    }
    if (bio !== undefined) {
      updates.push("bio = ?")
      values.push(bio)
    }
    if (avatar !== undefined) { 
      updates.push("avatar = ?")
      values.push(avatar)
    }
    if (university) {
      updates.push("university = ?")
      values.push(university)
    }
    if (major) {
      updates.push("major = ?")
      values.push(major)
    }
    if (password) {
      const hashedPassword = await hashPassword(password)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(id)

    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values) 

    const [user] = await query(
      `SELECT id, email, name, role, avatar, bio, university, major, created_at
       FROM users WHERE id = ?`,
      [id],
    )

    return NextResponse.json({
      ...user,
      createdAt: user.created_at,
    })
  } catch (error: any) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}