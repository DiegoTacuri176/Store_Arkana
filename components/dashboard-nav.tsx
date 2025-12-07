"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingBag, Settings, User } from "lucide-react"

const navItems = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mis Trabajos",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  }
]

// Definimos la interfaz para recibir el rol
interface DashboardNavProps {
  userRole?: string // puede ser "buyer", "seller" o undefined
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  // FILTRO: Si el usuario es "buyer", ocultamos "Resumen" y "Mis Trabajos"
  const filteredNavItems = navItems.filter((item) => {
    if (userRole === "buyer") {
      // Retornamos FALSE para ocultar estos items
      return item.title !== "Resumen" && item.title !== "Mis Trabajos"
    }
    // Si no es buyer (es seller o admin), mostramos todo (TRUE)
    return true
  })

  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}