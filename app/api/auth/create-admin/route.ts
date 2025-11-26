import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { hashPassword } from "@/lib/password"

// Endpoint temporal para crear un usuario admin de prueba
export async function POST(request: NextRequest) {
  try {
    const adminEmail = "admin@marketplace.com"
    const adminPassword = "admin123"

    // Verificar si ya existe
    const existing = await query<any[]>("SELECT * FROM users WHERE email = ?", [adminEmail])

    if (existing.length > 0) {
      return NextResponse.json({ message: "Admin ya existe", email: adminEmail }, { status: 200 })
    }

    // Crear admin
    const hashedPassword = await hashPassword(adminPassword)

    await query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())", [
      "Administrador",
      adminEmail,
      hashedPassword,
      "admin",
    ])

    console.log("[v0] Admin created successfully")

    return NextResponse.json(
      {
        message: "Admin creado exitosamente",
        credentials: {
          email: adminEmail,
          password: adminPassword,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
    return NextResponse.json({ error: "Error al crear admin" }, { status: 500 })
  }
}
