"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/lib/auth"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Manejo de redirección si ya está logueado
  useEffect(() => {
    const user = AuthService.getCurrentUser()
    if (user) {
      router.replace(redirect) 
    }
  }, [router, redirect])


  // 🔹 Cargar script de Google
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "920328503977-v106j9j7cn27i26oij90ufbl4g5jhvg8.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        })
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large", width: "100%" }
        )
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 🔹 Manejo login con Google
  const handleGoogleResponse = async (response: any) => {
    setError("")
    setIsLoading(true)

    try {
      const { user, error: loginError } = await AuthService.googleLogin(response.credential)

      setIsLoading(false)

      if (user) {
        router.push(redirect)
        router.refresh()
      } else {
        setError(loginError || "Error al iniciar sesión con Google")
      }
    } catch (err) {
      setIsLoading(false)
      setError("Error al procesar el login de Google")
    }
  }

  // 🔹 Manejo login por email
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { user, error: loginError } = await AuthService.login(email, password)

    setIsLoading(false)

    if (user) {
      router.replace(redirect) 
      router.refresh()
    } else {
      setError(loginError || "Error al iniciar sesión")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta de Student Market</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Botón oficial de Google Sign-In */}
            <div id="google-signin-button" className="flex justify-center"></div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con email
                </span>
              </div>
            </div>

            {/* Formulario login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Regístrate
              </Link>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold">Usuario de prueba:</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Email: admin@marketplace.com</li>
                <li>• Contraseña: admin123</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
