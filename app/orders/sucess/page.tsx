"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { CartService } from "@/lib/cart" 

export default function OrderSuccessPage() {
  const router = useRouter()
  
  useEffect(() => {
    CartService.clearCart(); 
    
    const timer = setTimeout(() => {
        router.replace("/dashboard/orders")
    }, 3000); 

    return () => clearTimeout(timer);

  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold">¡Pago Exitoso!</h1>
              <p className="mt-2 text-muted-foreground">
                Tu pedido ha sido confirmado. Estamos creando la orden en tu cuenta.
              </p>
              <div className="mt-6 text-sm text-muted-foreground">
                <p>Redirigiendo a tus pedidos...</p>
                <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}