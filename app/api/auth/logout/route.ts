import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logout exitoso" }, { status: 200 })

    // Eliminar cookie de usuario
    response.cookies.delete("user")

    return response
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
