import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { hashPassword, generateId } from "@/lib/password"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role = "buyer" } = body

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password y nombre son requeridos" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    // Validar longitud de password
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUsers = await query<any[]>("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
    }

    // Hashear password
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const userId = generateId("user")
    await query("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)", [
      userId,
      email,
      hashedPassword,
      name,
      role,
    ])

    // Obtener usuario creado
    const users = await query<any[]>(
      "SELECT id, email, name, role, avatar, bio, university, major, created_at FROM users WHERE id = ?",
      [userId],
    )

    const user: User = users[0]

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
