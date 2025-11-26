import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import type { User } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Obtener userId de las cookies
    const cookies = request.cookies
    const userCookie = cookies.get("user")

    if (!userCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    const userId = userData.id

    // Buscar usuario en la base de datos
    const users = await query<any[]>(
      "SELECT id, email, name, role, avatar, bio, university, major, created_at FROM users WHERE id = ?",
      [userId],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const user: User = users[0]

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}
