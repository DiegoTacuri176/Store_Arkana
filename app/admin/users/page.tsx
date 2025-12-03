"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthService } from "@/lib/auth"
import type { User } from "@/lib/types"
import { MoreVertical, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminUsersPage() {
  const router = useRouter()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" })

      if (!res.ok) {
        if (res.status === 403) router.replace("/login")
        throw new Error(`Error fetching users: ${res.status}`)
      }

      const usersData = await res.json()
      setAllUsers(usersData)

    } catch (error) {
      console.error("Error loading users:", error)
      alert("Error al cargar la lista de usuarios. Revisa la consola para detalles.")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres suspender/eliminar al usuario "${userName}"? Esta acción es irreversible y eliminará todos sus datos.`)) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      alert(`Usuario "${userName}" eliminado exitosamente.`)
      loadUsers()

    } catch (error) {
      console.error("Error deleting user:", error)
      alert(`Error al eliminar al usuario. Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`)
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = AuthService.getCurrentUser()

    if (!user || user.role !== "admin") {
      router.replace("/login")
      return
    }
    setCurrentUser(user)
    loadUsers()
  }, [router, loadUsers])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      case "seller":
        return <Badge className="bg-blue-500">Vendedor</Badge>
      case "buyer":
        return <Badge variant="secondary">Comprador</Badge>
      default:
        return <Badge variant="outline">{role || "Usuario"}</Badge>
    }
  }

  const formatDate = (date: any) => {
    if (!date) return "—"
    try {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) return "—"
      return parsedDate.toLocaleDateString("es-PE", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "—"
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground mt-4">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra todos los usuarios de la plataforma</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <Card>
            <CardContent className="pr-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={u.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name || "Sin nombre"}</p>
                            {u.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{u.bio}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{u.email || "Sin correo"}</TableCell>
                      <TableCell>{getRoleBadge(u.role || "buyer")}</TableCell>
                      <TableCell>{formatDate(u.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                            <DropdownMenuItem>Ver Trabajos</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(u.id, u.name || 'este usuario')}
                              disabled={loading}
                            >
                              Suspender
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {allUsers.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No se encontraron usuarios (excluyendo administradores).</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}