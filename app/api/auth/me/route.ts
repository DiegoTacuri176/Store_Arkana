import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import type { User } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Obtener userId de las cookies
    const cookies = request.cookies
    const userCookie = cookies.get("marketplace_current_user") 

    if (!userCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const userData: any = JSON.parse(userCookie.value)
    const userId = userData.id 

    const users = await query<any>(
      `SELECT id, email, name, role, avatar, bio, university, major, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userFromDB = users[0] as Record<string, any> 


    const user: User = {
        id: userFromDB.id,
        email: userFromDB.email,
        name: userFromDB.name,
        role: userFromDB.role,
        avatar: userFromDB.avatar, // CRUCIAL: Avatar URL
        bio: userFromDB.bio,
        university: userFromDB.university,
        major: userFromDB.major,
        createdAt: userFromDB.created_at, 
        updatedAt: userFromDB.updated_at,
    }


    // El cuerpo de la respuesta se devuelve
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}