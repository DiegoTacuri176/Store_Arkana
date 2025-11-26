import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { verifyPassword } from "@/lib/password"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] Login attempt for email:", email)

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario por email
    const users = await query<any[]>("SELECT * FROM users WHERE email = ?", [email])

    console.log("[v0] Users found:", users.length)

    if (users.length === 0) {
      console.log("[v0] No user found with email:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const userWithPassword = users[0]
    console.log("[v0] User found:", {
      id: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role,
    })

    // Verificar password
    const isValidPassword = await verifyPassword(password, userWithPassword.password)

    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[v0] Invalid password for user:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Remover password del objeto de respuesta
    const { password: _, ...user } = userWithPassword

    return NextResponse.json(
      {
        message: "Login exitoso",
        user: user as User,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
