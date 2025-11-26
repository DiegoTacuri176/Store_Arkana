"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, Eye } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Product, User } from "@/lib/types"

interface ProductCardProps {
  product: Product
  seller?: User
}

export function ProductCard({ product, seller }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.featured && <Badge className="absolute left-3 top-3">Destacado</Badge>}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-tight text-balance">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          {seller && (
            <Link
              href={`/profile/${seller.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={seller.profile_picture_url || seller.avatar || "/placeholder.svg"} />
                <AvatarFallback>{seller.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{seller.name}</span>
            </Link>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{product.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
          </div>
          <span className="font-heading text-xl font-bold">${product.price}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}