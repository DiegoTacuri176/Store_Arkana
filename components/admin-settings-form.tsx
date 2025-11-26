"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { User } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminSettingsFormProps {
  user: User
}

export function AdminSettingsForm({ user }: AdminSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [platformSettings, setPlatformSettings] = useState({
    platformName: "Student Market",
    platformEmail: "admin@studentmarket.com",
    supportEmail: "support@studentmarket.com",
    commissionRate: "10",
    minProductPrice: "5",
    maxProductPrice: "10000",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordData.newPassword }),
      })

      if (!res.ok) throw new Error("Error updating password")

      alert("Contraseña actualizada exitosamente")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      console.error("[v0] Error updating password:", error)
      alert("Error al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlatformSettings = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Configuraciones guardadas exitosamente")
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      alert("Error al guardar las configuraciones")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="payments">Pagos</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="security">Seguridad</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Plataforma</CardTitle>
            <CardDescription>Configura la información básica de la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Nombre de la Plataforma</Label>
              <Input
                id="platformName"
                value={platformSettings.platformName}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformEmail">Email de la Plataforma</Label>
              <Input
                id="platformEmail"
                type="email"
                value={platformSettings.platformEmail}
                onChange={(e) => setPlatformSettings({ ...platformSettings, platformEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Soporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={platformSettings.supportEmail}
                onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Mantenimiento</Label>
                <p className="text-sm text-muted-foreground">Desactiva temporalmente la plataforma</p>
              </div>
              <Switch
                checked={platformSettings.maintenanceMode}
                onCheckedChange={(checked) => setPlatformSettings({ ...platformSettings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Registro</Label>
                <p className="text-sm text-muted-foreground">Permite que nuevos usuarios se registren</p>
              </div>
              <Switch
                checked={platformSettings.allowRegistration}
                onCheckedChange={(checked) => setPlatformSettings({ ...platformSettings, allowRegistration: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificación de Email</Label>
                <p className="text-sm text-muted-foreground">Requiere verificación de email al registrarse</p>
              </div>
              <Switch
                checked={platformSettings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setPlatformSettings({ ...platformSettings, requireEmailVerification: checked })
                }
              />
            </div>

            <Button onClick={handleSavePlatformSettings} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Pagos</CardTitle>
            <CardDescription>Gestiona comisiones y límites de precios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Tasa de Comisión (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                value={platformSettings.commissionRate}
                onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRate: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Porcentaje que la plataforma cobra por cada venta</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Precio Mínimo ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="0"
                  value={platformSettings.minProductPrice}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, minProductPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Precio Máximo ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="0"
                  value={platformSettings.maxProductPrice}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, maxProductPrice: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSavePlatformSettings} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>Configura los métodos de pago disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tarjeta de Crédito/Débito</Label>
                <p className="text-sm text-muted-foreground">Stripe, PayPal</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Transferencia Bancaria</Label>
                <p className="text-sm text-muted-foreground">Transferencias directas</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Criptomonedas</Label>
                <p className="text-sm text-muted-foreground">Bitcoin, Ethereum</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones del Sistema</CardTitle>
            <CardDescription>Configura las notificaciones automáticas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevos Registros</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando un nuevo usuario se registra</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevos Productos</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando se publica un nuevo trabajo</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevas Ventas</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando se realiza una venta</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reportes de Usuarios</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando un usuario reporta contenido</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Errores del Sistema</Label>
                <p className="text-sm text-muted-foreground">Notificar errores críticos del sistema</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones por Email</CardTitle>
            <CardDescription>Configura las plantillas de email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeEmail">Email de Bienvenida</Label>
              <Textarea id="welcomeEmail" placeholder="Escribe el contenido del email de bienvenida..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderConfirmation">Confirmación de Pedido</Label>
              <Textarea
                id="orderConfirmation"
                placeholder="Escribe el contenido del email de confirmación..."
                rows={4}
              />
            </div>

            <Button onClick={handleSavePlatformSettings} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Plantillas"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seguridad de la Cuenta</CardTitle>
            <CardDescription>Gestiona la seguridad de tu cuenta de administrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Cambiar Contraseña</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handlePasswordChange}>
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>Ingresa tu nueva contraseña de administrador</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de Actividad</Label>
                <p className="text-sm text-muted-foreground">Mantén un registro de todas las acciones</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad de la Plataforma</CardTitle>
            <CardDescription>Configura las políticas de seguridad globales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" min="5" max="1440" />
              <p className="text-sm text-muted-foreground">
                Tiempo antes de cerrar sesión automáticamente por inactividad
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
              <Input id="maxLoginAttempts" type="number" defaultValue="5" min="3" max="10" />
              <p className="text-sm text-muted-foreground">Número de intentos fallidos antes de bloquear la cuenta</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Forzar Contraseñas Seguras</Label>
                <p className="text-sm text-muted-foreground">Requiere mayúsculas, números y símbolos</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Protección CSRF</Label>
                <p className="text-sm text-muted-foreground">Protección contra ataques de falsificación</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button onClick={handleSavePlatformSettings} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Roles</CardTitle>
            <CardDescription>Administra los permisos de los diferentes roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rol de Admin</Label>
              <p className="text-sm text-muted-foreground">Acceso completo a todas las funciones</p>
            </div>

            <div className="space-y-2">
              <Label>Rol de Vendedor</Label>
              <div className="space-y-2 pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Publicar productos</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ver estadísticas</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gestionar pedidos</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rol de Comprador</Label>
              <div className="space-y-2 pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Realizar compras</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dejar reseñas</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comentar productos</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}