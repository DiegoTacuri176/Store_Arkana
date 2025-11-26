"use client"

import type { CartItem, Product } from "./types"
import { CookieService } from "./cookies"

export class CartService {
  private static STORAGE_KEY = "marketplace_cart"

  static getCart(): CartItem[] {
    if (typeof window === "undefined") return []

    return CookieService.getJSON<CartItem[]>(this.STORAGE_KEY) || []
  }

  static addToCart(product: Product, quantity = 1): void {
    const cart = this.getCart()
    const existingIndex = cart.findIndex((item) => item.product.id === product.id)

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity
    } else {
      cart.push({ product, quantity })
    }

    CookieService.setJSON(this.STORAGE_KEY, cart, 7) // 7 days expiration
    window.dispatchEvent(new Event("cart-updated"))
  }

  static removeFromCart(productId: string): void {
    const cart = this.getCart().filter((item) => item.product.id !== productId)
    CookieService.setJSON(this.STORAGE_KEY, cart, 7)
    window.dispatchEvent(new Event("cart-updated"))
  }

  static updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCart()
    const item = cart.find((item) => item.product.id === productId)

    if (item) {
      item.quantity = quantity
      CookieService.setJSON(this.STORAGE_KEY, cart, 7)
      window.dispatchEvent(new Event("cart-updated"))
    }
  }

  static clearCart(): void {
    CookieService.remove(this.STORAGE_KEY)
    window.dispatchEvent(new Event("cart-updated"))
  }

  static getTotal(): number {
    return this.getCart().reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  static getItemCount(): number {
    return this.getCart().reduce((count, item) => count + item.quantity, 0)
  }
}
