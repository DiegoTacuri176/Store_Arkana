"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CartService } from "@/lib/cart"

export function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const success = searchParams.get("success")

  useEffect(() => {
    if (success) {
        
      CartService.clearCart()
      
      window.dispatchEvent(new Event("cart-updated"))

      const newUrl = window.location.pathname
      router.replace(newUrl)
    }
  }, [success, router])

  return null
}