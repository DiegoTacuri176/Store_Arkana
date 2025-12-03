import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Download, ArrowLeft } from "lucide-react"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  
  // Esperamos a que los params se resuelvan (Requerido en Next.js 15)
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Obtenemos los pedidos del comprador
  const orderRes = await fetch(`${apiUrl}/api/orders?buyerId=${id}`, {
    cache: "no-store",
  });

  if (!orderRes.ok) {
    notFound()
  }

  const orders = await orderRes.json()
  // Buscamos el pedido específico por ID
  const order = orders.find((o: any) => o.id === id) || orders[0]

  if (!order) {
    notFound()
  }

  // --- SOLUCIÓN ERROR TOFIXED ---
  // Convertimos los valores a Number() explícitamente.
  // MySQL devuelve los tipos DECIMAL como strings para mantener precisión,
  // por lo que .toFixed() falla si no convertimos primero.
  
  const subtotal =
    order.items?.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0,
    ) || Number(order.total)
    
  const tax = subtotal * 0.1
  const total = Number(order.total)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          {/* Tarjeta de Éxito / Estado */}
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold">
                Compra Completada
              </h1>
              <p className="mt-2 text-muted-foreground">
                Tu pedido ha sido procesado exitosamente. Recibirás un email de
                confirmación pronto.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href="/explore">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Seguir Comprando
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/orders">Ver Mis Pedidos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del Pedido */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles del Pedido</CardTitle>
                <Badge
                  className={
                    order.status === "completed"
                      ? "bg-green-500"
                      : order.status === "processing"
                      ? "bg-blue-500"
                      : order.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }
                >
                  {/* Mapeo de estados para mostrar texto amigable */}
                  {order.status === "completed"
                    ? "Completado"
                    : order.status === "processing"
                    ? "Procesando"
                    : order.status === "cancelled"
                    ? "Cancelado"
                    : "Pendiente"}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span>Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                <span>•</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Lista de Artículos */}
              <div>
                <h3 className="mb-4 font-semibold">Artículos</h3>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product_title}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vendedor: {item.seller_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {/* Calculamos el total por item asegurando conversión a número */}
                          ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Resumen de Costos */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-heading text-xl font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Información adicional */}
              <div className="rounded-lg bg-muted p-4">
                <h4 className="mb-2 font-semibold">Información Importante</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • Los archivos digitales están disponibles para descarga
                    inmediata
                  </li>
                  <li>
                    • Recibirás un email con los enlaces de descarga
                  </li>
                  <li>
                    • Si tienes alguna pregunta, contacta al vendedor
                    directamente
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}