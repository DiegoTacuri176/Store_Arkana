import { NextResponse, type NextRequest } from "next/server"
import { Database } from "@/lib/db"
import { getServerAuth } from "@/lib/auth"
import type { User } from "@/lib/types"

async function checkAdmin(): Promise<User | NextResponse> {
  const user = await getServerAuth()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  return user
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdmin()

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const users = await Database.getUsers({ excludeRole: "admin" })

    const formattedUsers = users.map((user: any) => ({
      ...user,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("[API] Error fetching admin users:", error)
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdmin()

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario es requerido" }, { status: 400 })
    }

    const deleted = await Database.deleteUser(userId)

    if (!deleted) {
      return NextResponse.json({ error: "Usuario no encontrado o error al eliminar" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error deleting user:", error)
    return NextResponse.json({ error: "Error interno al eliminar usuario" }, { status: 500 })
  }
}