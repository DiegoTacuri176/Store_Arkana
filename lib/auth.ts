import type { User } from "./types"
import { CookieService } from "./cookies"

export class AuthService {
  private static STORAGE_KEY = "marketplace_current_user"


  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    return CookieService.getJSON<User>(this.STORAGE_KEY)
  }

  static updateCurrentUser(updatedUser: Partial<User>): User | null {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    const newUser = { ...currentUser, ...updatedUser }
    CookieService.setJSON(this.STORAGE_KEY, newUser, 30)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
    return newUser
  }

  // --- LOGIN NORMAL ---
  static async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) return { user: null, error: data.error || "Error al iniciar sesión" }

      CookieService.setJSON(this.STORAGE_KEY, data.user, 30)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
      return { user: data.user, error: null }
    } catch (error) {
      console.error("[AuthService] Login error:", error)
      return { user: null, error: "Error de conexión. Intenta de nuevo." }
    }
  }

  // --- LOGIN CON GOOGLE ---
  static async googleLogin(credential: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      })

      const data = await response.json()
      if (!response.ok) return { user: null, error: data.error || "Error al iniciar sesión con Google" }

      CookieService.setJSON(this.STORAGE_KEY, data.user, 30)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
      return { user: data.user, error: null }
    } catch (error) {
      console.error("[AuthService] Google login error:", error)
      return { user: null, error: "Error de conexión. Intenta de nuevo." }
    }
  }

  // --- REGISTRO CON GOOGLE ---
  static async googleRegister(
    credential: string,
    role: User["role"] = "buyer",
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, role, isRegister: true }),
      })

      const data = await response.json()
      if (!response.ok) return { user: null, error: data.error || "Error al registrar con Google" }

      CookieService.setJSON(this.STORAGE_KEY, data.user, 30)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
      return { user: data.user, error: null }
    } catch (error) {
      console.error("[AuthService] Google register error:", error)
      return { user: null, error: "Error de conexión. Intenta de nuevo." }
    }
  }

  // --- REGISTRO NORMAL ---
  static async register(
    email: string,
    password: string,
    name: string,
    role: User["role"] = "buyer",
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })

      const data = await response.json()
      if (!response.ok) return { user: null, error: data.error || "Error al registrar usuario" }

      CookieService.setJSON(this.STORAGE_KEY, data.user, 30)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
      return { user: data.user, error: null }
    } catch (error) {
      console.error("[AuthService] Register error:", error)
      return { user: null, error: "Error de conexión. Intenta de nuevo." }
    }
  }

  // --- LOGOUT ---
  static async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[AuthService] Logout error:", error)
    } finally {
      CookieService.remove(this.STORAGE_KEY)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-changed"))
    }
  }

  // --- VERIFICACIÓN DE AUTENTICACIÓN Y ROL ---
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static hasRole(role: User["role"]): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // --- REFRESCAR USUARIO ---
  static async refreshUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        this.logout()
        return null
      }

      const data = await response.json()
      CookieService.setJSON(this.STORAGE_KEY, data.user, 30)
      return data.user
    } catch (error) {
      console.error("[AuthService] Refresh user error:", error)
      return null
    }
  }

  // --- DECODIFICAR TOKEN DE GOOGLE ---
  static decodeGoogleToken(token: string): { email: string; name: string; picture?: string } | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        console.error("[AuthService] Invalid Google token format")
        return null
      }

      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )

      const decoded = JSON.parse(jsonPayload)
      const { email, name, picture } = decoded
      return { email, name, picture }
    } catch (error) {
      console.error("[AuthService] Failed to decode Google token:", error)
      return null
    }
  }
}

// --- SERVER AUTH ---
export async function getServerAuth(): Promise<User | null> {
  if (typeof window !== "undefined") {
    throw new Error("getServerAuth can only be used in Server Components")
  }

  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("marketplace_current_user")

    if (!userCookie) return null

    return JSON.parse(userCookie.value) as User
  } catch (err) {
    console.error("[AuthService] Error parsing user cookie:", err)
    return null
  }
}