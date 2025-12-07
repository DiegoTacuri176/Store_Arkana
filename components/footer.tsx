"use client"

import Link from "next/link"
import { AuthService } from "@/lib/auth"
import { useState, useEffect } from "react"

export function Footer() {
  const [user, setUser] = useState(AuthService.getCurrentUser())

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(AuthService.getCurrentUser())
    }

    window.addEventListener("auth-changed", handleAuthChange)
    return () => window.removeEventListener("auth-changed", handleAuthChange)
  }, [])

  return (
    <footer className="border-t bg-muted/30 px-5 py-4">
      <div className="w-full flex flex-col justify-between p-1">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">AR</span>
              </div>
              <span className="font-heading font-bold">Arkana</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Plataforma donde estudiantes pueden exponer y vender sus trabajos creativos
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="font-semibold">Explorar</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-foreground transition-colors">
                  Todos los Trabajos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* User Links - Conditional based on role */}
          <div>
            <h4 className="font-semibold">{user ? "Mi Cuenta" : "Recursos"}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {user ? (
                <>
                  <li>
                    <Link href="/dashboard/profile" className="hover:text-foreground transition-colors">
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/orders" className="hover:text-foreground transition-colors">
                      Mis Pedidos
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/settings" className="hover:text-foreground transition-colors">
                      Configuración
                    </Link>
                  </li>
                  {(user.role === "seller" || user.role === "admin") && (
                    <li>
                      <Link href="/dashboard" className="hover:text-foreground transition-colors">
                        Dashboard
                      </Link>
                    </li>
                  )}
                  {user.role === "admin" && (
                    <li>
                      <Link href="/admin" className="hover:text-foreground transition-colors">
                        Panel Admin
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/about" className="hover:text-foreground transition-colors">
                      Acerca de
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="hover:text-foreground transition-colors">
                      Centro de Ayuda
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-foreground transition-colors">
                      Contacto
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
              {!user && (
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AR Arkana. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
