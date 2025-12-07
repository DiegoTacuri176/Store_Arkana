"use client"

import Link from "next/link"
import { ShoppingCart, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AuthService } from "@/lib/auth"
import { CartService } from "@/lib/cart"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {

  const [user, setUser] = useState(AuthService.getCurrentUser())
  const [cartCount, setCartCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-user.jpg")

  useEffect(() => {
    const updateCart = () => {
      setCartCount(CartService.getItemCount())
    }

    updateCart()
    window.addEventListener("cart-updated", updateCart)
    return () => window.removeEventListener("cart-updated", updateCart)
  }, [])

  useEffect(() => {
    // 1. Función para obtener datos frescos de la Base de Datos
    const fetchFreshUser = async () => {
      try {
        // Solo intentamos refrescar si parece que hay un usuario logueado
        if (AuthService.isAuthenticated()) {
          // refreshUser llama a /api/auth/me, que consulta directo a la BD
          const freshUser = await AuthService.refreshUser()
          if (freshUser) {
            setUser(freshUser)
          }
        }
      } catch (error) {
        console.error("Error refreshing user data:", error)
      }
    }

    // Ejecutamos la carga fresca al montar el componente
    fetchFreshUser()

    // Listener para cambios locales (login/logout)
    const handleAuthChange = () => {
      const currentUser = AuthService.getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener("auth-changed", handleAuthChange)
    return () => window.removeEventListener("auth-changed", handleAuthChange)
  }, [])

  // 2. Actualizamos el avatarUrl cada vez que el objeto 'user' cambia
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar)
    } else {
      setAvatarUrl("/placeholder-user.jpg")
    }
  }, [user])

  // Lógica de Logout - Modificación Clave
  const handleLogout = () => {
    // 1. Limpiar el carrito de la sesión anterior (solución al problema)
    CartService.clearCart() 
    
    // 2. Ejecutar el logout de autenticación (elimina la cookie de usuario)
    AuthService.logout()
    
    // 3. Reiniciar el estado local y redirigir
    setUser(null)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5">
      <div className=" flex h-16 items-center justify-between w-full p-1">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">AR</span>
            </div>
            <span className="hidden font-heading text-xl font-bold sm:inline-block">Arkana</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/explore"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explorar
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Categorías
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5" />
          </Button> */}

          {/* <div className="hidden md:block">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar trabajos..." className="pl-8" />
            </div>
          </div> */}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} style={{ objectFit: "cover" }} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {user.role === "seller" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Mi Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Panel Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/orders">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          )}

          {/* <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button> */}
        </div>
      </div>

      {/* {searchOpen && (
        <div className="border-t p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar trabajos..." className="pl-8" />
          </div>
        </div>
      )} */}
    </header>
  )
}