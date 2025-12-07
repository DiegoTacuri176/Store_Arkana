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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthService } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import type { User } from "@/lib/types"

declare global {
  interface Window {
    google: any
  }
}

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<User["role"]>("buyer")
  const [error, setError] = useState("")
  const searchParams = useSearchParams()  
  const redirect = searchParams.get("redirect") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleRegistered, setIsGoogleRegistered] = useState(false)
  const [googleCredential, setGoogleCredential] = useState<string>("")

    // Manejo de redirección si ya está logueado
    useEffect(() => {
      const user = AuthService.getCurrentUser()
      if (user) {
        router.push(redirect)
      }
    }, [router, redirect])


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
        window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
          theme: "outline",
          size: "large",
          width: "100%",
        })
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setError("")
    setIsGoogleLoading(true)

    try {
      const userInfo = AuthService.decodeGoogleToken(response.credential)

      if (userInfo) {
        setName(userInfo.name)
        setEmail(userInfo.email)
        setPassword("")
        setConfirmPassword("")
        setGoogleCredential(response.credential)
        setRole("seller")
        setIsGoogleRegistered(true)
      } else {
        setError("Error al procesar la información de Google")
      }
    } catch (err) {
      setError("Error al procesar Google Sign-In")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    setIsLoading(true)

    let result
    if (isGoogleRegistered) {
      result = await AuthService.googleRegister(googleCredential, role)
    } else {
      
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setIsLoading(false)
        return
      }

      result = await AuthService.register(email, password, name, role)
    }

    setIsLoading(false)

    if (result.user) {
      router.push("/")
      router.refresh()
    } else {
      setError(result.error || "Error al registrar usuario")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Únete a Student Market y comienza a vender tus trabajos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="google-signin-button" className="flex justify-center"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continúa con email</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading || isGoogleRegistered}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading || isGoogleRegistered}
                />
              </div>

              {!isGoogleRegistered && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || isGoogleLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading || isGoogleLoading}
                    />
                  </div>
                </>
              )}

              {isGoogleRegistered && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                  ✓ Datos de Google cargados correctamente. Te registrarás como <strong>Vendedor</strong>.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de cuenta</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as User["role"])}
                  disabled={isLoading || isGoogleLoading || isGoogleRegistered}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Comprador</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
