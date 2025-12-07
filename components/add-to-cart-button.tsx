"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { CartService } from "@/lib/cart"
import type { Product } from "@/lib/types"
import { useState } from "react"

interface AddToCartButtonProps {
  product: Product
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    CartService.addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button onClick={handleAddToCart} className={className} disabled={added}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      {added ? "Agregado" : "Agregar al Carrito"}
    </Button>
  )
}
