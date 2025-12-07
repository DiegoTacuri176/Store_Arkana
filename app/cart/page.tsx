"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CartService } from "@/lib/cart"
import { AuthService } from "@/lib/auth"
import type { CartItem } from "@/lib/types"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader2 } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true) 
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false) 

  useEffect(() => {
    loadCart()

    const handleCartUpdate = () => {
      loadCart()
    }

    window.addEventListener("cart-updated", handleCartUpdate)
    return () => window.removeEventListener("cart-updated", handleCartUpdate)
  }, [])

  const loadCart = () => {
    setCartItems(CartService.getCart())
    setLoading(false)
  }

  const handleRemove = (productId: string) => {
    CartService.removeFromCart(productId)
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    CartService.updateQuantity(productId, quantity)
  }

  const subtotal = CartService.getTotal()
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  const handleCheckout = async () => {
    const user = AuthService.getCurrentUser()
    
    if (!user) {
      router.push("/login?redirect=/cart")
      return
    }
    
    setIsCheckoutLoading(true)
    
    try {
      const items = cartItems.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        images: item.product.images
      }))

      const res = await fetch("/api/checkout_session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
              items,
          }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.error || "Error al crear sesión de pago");
      }
      
      if (data.url) {
        window.location.href = data.url; 
      } else {
        throw new Error("No se recibió una URL de sesión de Stripe válida.");
      }

    } catch (error: any) {
      console.error("[Cart] Error creating checkout session:", error)
      const errorMessage = error.message || 'Error de conexión';
      alert(`Error al iniciar el pago: ${errorMessage}`)
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Carrito de Compras</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "artículo" : "artículos"} en tu carrito
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 font-heading text-xl font-semibold">Tu carrito está vacío</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Explora nuestros trabajos y agrega algunos al carrito
              </p>
              <Button className="mt-6" asChild>
                <Link href="/explore">Explorar Trabajos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Artículos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id}>
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                          <Image
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            unoptimized 
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link href={`/products/${item.product.id}`} className="font-semibold hover:text-primary">
                              {item.product.title}
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {item.product.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                disabled={isCheckoutLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                disabled={isCheckoutLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemove(item.product.id)}
                              disabled={isCheckoutLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">${item.product.price} c/u</p>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-heading text-2xl font-bold">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleCheckout} 
                    disabled={isCheckoutLoading}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirigiendo...
                      </>
                    ) : (
                      <>
                        Proceder al Pago
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/explore">Continuar Comprando</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}