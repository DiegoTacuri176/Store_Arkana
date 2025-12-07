// Core entity types for the marketplace

export type UserRole = "admin" | "seller" | "buyer"

export interface User {
  id: string
  email?: string
  name: string
  role?: UserRole
  avatar?: string
  bio?: string
  profile_picture_url?: string
  createdAt?: Date
  updatedAt?: Date
  major?: string,
  university?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  image_url?: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  image_url?: string
  categoryId: string
  seller_id: string
  status: "pending" | "approved" | "rejected"
  featured: boolean
  views: number
  created_at: string
  updatedAt: Date
  sellerName?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Comment {
  id: string
  productId: string
  userId: string
  content: string
  createdAt: Date
}

export interface Order {
  id: string
  buyerId: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface CartItem {
  product: Product
  quantity: number
}
