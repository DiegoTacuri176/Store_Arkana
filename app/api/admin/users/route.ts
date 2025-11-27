import { NextResponse, type NextRequest } from "next/server"
import { Database } from "@/lib/db"
import { getServerAuth } from "@/lib/auth"
import type { User } from "@/lib/types" // Importación necesaria para tipado

// Helper para verificar el rol de administrador y actuar como Type Guard
async function checkAdmin(): Promise<User | NextResponse> {
    const user = await getServerAuth()
    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    return user
}

// GET /api/admin/users - Obtener todos los usuarios (excluyendo administradores)
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdmin() // Tipo: User | NextResponse
    
    // Type Guard: Si es una instancia de NextResponse, devolverla inmediatamente.
    if (authResult instanceof NextResponse) {
        return authResult
    }

    // Llama al método del servidor Database.getUsers (ahora que sabemos que es admin)
    const users = await Database.getUsers({ excludeRole: "admin" })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[API] Error fetching admin users:", error)
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500 })
  }
}

// DELETE /api/admin/users?id={userId} - Eliminar un usuario
export async function DELETE(request: NextRequest) {
    try {
        const authResult = await checkAdmin() // Tipo: User | NextResponse
        
        // Type Guard: Si es una instancia de NextResponse, devolverla inmediatamente.
        if (authResult instanceof NextResponse) {
            return authResult
        }
        
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("id")

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario es requerido" }, { status: 400 })
        }
        
        // Llama al método del servidor Database.deleteUser
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
