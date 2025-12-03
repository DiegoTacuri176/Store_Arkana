import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckoutSuccess } from "@/components/CheckoutSuccess" 
import { 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  Clock, 
  XCircle, 
  Package, 
  Calendar,
  CreditCard,
  Box
} from "lucide-react"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${apiUrl}/api/orders/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const order = await res.json();

  const subtotal = order.items.reduce((acc: number, item: any) => {
    return acc + (Number(item.price) * Number(item.quantity));
  }, 0);

  const tax = subtotal * 0.10;
  const total = Number(order.total);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1"><CheckCircle2 className="w-3 h-3 mr-1"/> Completado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1"><Clock className="w-3 h-3 mr-1"/> Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="px-3 py-1"><XCircle className="w-3 h-3 mr-1"/> Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Lógica para limpiar carrito si viene de Stripe */}
      <CheckoutSuccess />

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis Pedidos
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold font-heading">Pedido #{order.id.slice(0, 8).toUpperCase()}</h2>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(order.created_at).toLocaleDateString("es-ES", { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-5 items-start">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        {item.product_images && item.product_images[0] ? (
                          <Image
                            src={item.product_images[0]}
                            alt={item.product_title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 grid gap-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-base">{item.product_title}</h4>
                          <span className="font-bold text-base">
                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Vendedor: <span className="font-medium text-foreground">{item.seller_name}</span>
                        </p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="font-normal text-xs bg-muted hover:bg-muted text-foreground border">
                            ${Number(item.price).toFixed(2)} x {item.quantity}
                          </Badge>
                        </div>
                        {order.status === 'completed' && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                              <Download className="w-3 h-3" />
                              Descargar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuestos (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Pagado</span>
                  <span className="font-heading font-black text-2xl">${total.toFixed(2)}</span>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-3 text-sm mt-4 border border-border/50">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium capitalize">{order.payment_method || "stripe"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-border/60 shadow-none">
              <CardContent className="p-6 flex gap-4">
                <div className="bg-background border rounded-full p-2 h-fit shadow-sm">
                  <Box className="w-5 h-5 text-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Entrega Digital</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Los archivos han sido enviados a <span className="font-medium text-foreground">{order.buyer_email}</span> y están disponibles para descarga en esta página.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}