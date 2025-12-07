import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { hashPassword } from "@/lib/password"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { credential, role = "buyer", isRegister = false } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: "Credencial de Google requerida" }, { status: 400 })
    }

    // Decode JWT token from Google
    const parts = credential.split(".")
    if (parts.length !== 3) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    const decoded = JSON.parse(jsonPayload)
    // Usamos 'picture' de Google y renombramos internamente a profilePicture
    const { email, name, picture: profilePicture, sub: googleId } = decoded 

    if (!email || !name) {
      return NextResponse.json({ error: "Email y nombre son requeridos" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await query("SELECT * FROM users WHERE email = ?", [email])

    let user

    if (existingUser.length > 0) {
  
      user = existingUser[0]
      if (!user.google_id) {
        
        await query("UPDATE users SET google_id = ?, avatar = ? WHERE id = ?", [ 
          googleId,
          profilePicture,
          user.id,
        ])
      }
    } else {
      // Create new user
      const userId = uuidv4()
      const defaultPassword = await hashPassword(uuidv4())
      const userRole = isRegister ? role : "buyer"

      await query(
        
        "INSERT INTO users (id, email, password, name, role, google_id, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [userId, email, defaultPassword, name, userRole, googleId, profilePicture],
      )

      user = {
        id: userId,
        email,
        name,
        role: userRole,
        google_id: googleId,
        avatar: profilePicture, // Usar avatar
      }
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.profile_picture || user.avatar || profilePicture, 
      },
    })
  } catch (error) {
    console.error("[v0] Google auth error:", error)
    return NextResponse.json({ error: "Error al procesar autenticación de Google" }, { status: 500 })
  }
}