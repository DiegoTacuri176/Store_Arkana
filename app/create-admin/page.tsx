"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; credentials?: any } | null>(null)

  const createAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          credentials: data.credentials,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Error al crear admin",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Usuario Admin</CardTitle>
          <CardDescription>Crea un usuario administrador de prueba para el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createAdmin} disabled={loading} className="w-full">
            {loading ? "Creando..." : "Crear Admin"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.credentials && (
                    <div className="mt-3 p-3 bg-muted rounded-md text-sm space-y-1">
                      <p>
                        <strong>Email:</strong> {result.credentials.email}
                      </p>
                      <p>
                        <strong>Password:</strong> {result.credentials.password}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Este endpoint creará un usuario admin con las siguientes credenciales:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Email: admin@marketplace.com</li>
              <li>Password: admin123</li>
              <li>Rol: admin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
