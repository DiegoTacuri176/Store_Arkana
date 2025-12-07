"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import type { Product, Category } from "@/lib/types" 

// Definición de tipos para la data
interface FilteredProduct extends Product {
  rating: number
  reviews: number
  categorySlug: string
  categoryName: string
  sellerName: string
  seller_avatar: string // Necesario para el ProductCard
}

interface CategoryFilter extends Category {
    product_count: number;
}

const MAX_PRICE = 1000 
const MIN_PRICE = 0

export default function CategoriesPage() {
  
  const [loading, setLoading] = useState(true)
  const [allProducts, setAllProducts] = useState<FilteredProduct[]>([])
  const [categories, setCategories] = useState<CategoryFilter[]>([])
  const [wishlist, setWishlist] = useState<Set<string>>(new Set()) // Usaremos Product ID
  
  // Filtros
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE])
  const [sortBy, setSortBy] = useState("relevance")
  
  const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // 1. Carga de Categorías (solo una vez)
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Error fetching categories:", err))
  }, [API_BASE])
  
  // 2. Carga de Productos (con filtro de categoría)
  const fetchProducts = useCallback((categorySlug: string) => {
    setLoading(true)
    let url = `${API_BASE}/api/products?status=approved`
    
    if (categorySlug !== "all") {
      url += `&category=${categorySlug}` // El API filtra por slug (c.slug)
    }

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        // Mapear la data del API para usarla en el filtro y la tarjeta de producto
        const mappedData: FilteredProduct[] = data.map((p: any) => ({
            ...p,
            rating: parseFloat(p.avg_rating) || 0,
            reviews: p.review_count || 0,
            categorySlug: p.category_slug,
            categoryName: p.category_name,
            sellerName: p.seller_name,
            seller_avatar: p.seller_avatar,
            images: typeof p.images === "string" ? JSON.parse(p.images) : p.images || [],
            sellerId: p.seller_id // Aseguramos el sellerId para el ProductCard
        }))
        setAllProducts(mappedData)
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false))
  }, [API_BASE])

  // Ejecutar fetch inicial y cuando la categoría cambie
  useEffect(() => {
    fetchProducts(selectedCategorySlug)
  }, [selectedCategorySlug, fetchProducts])


  // Manejadores de Interacción
  const toggleWishlist = (id: string) => {
    const newWishlist = new Set(wishlist)
    if (newWishlist.has(id)) {
      newWishlist.delete(id)
    } else {
      newWishlist.add(id)
    }
    setWishlist(newWishlist)
  }

  // Lógica de filtrado y ordenamiento en el cliente
  const filteredProducts = useMemo(() => {
    let result = allProducts

    // 1. Filtrar por rango de precio (CLIENT-SIDE)
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // 2. Ordenar (CLIENT-SIDE)
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    } 
    // "relevance" (por defecto) está manejado por el orden DESC de la API

    return result
  }, [allProducts, priceRange, sortBy])


  return (
    <main className="min-h-screen bg-background">
        <Header />
      {/* Banner - Mantenido sin cambios */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold md:text-4xl leading-tight text-balance">
                Explora las categorías y descubre proyectos únicos creados por estudiantes.
              </h1>
            </div>

            <div className="flex justify-center items-center ">
              <img
                src="/categorias_page_portada.jpg"
                alt="Creative tools showcase"
                className="w-full h-auto max-w-sm object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-gray-200 px-6 py-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Category Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Categorías</h3>
            <div className="flex flex-wrap gap-2">
                {/* Botón para todas las categorías */}
                <button
                    onClick={() => setSelectedCategorySlug("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategorySlug === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    }`}
                >
                    Todas las Categorías
                </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategorySlug(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategorySlug === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {category.icon} {category.name} {category.product_count > 0 && `(${category.product_count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Rango de Precio</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Mínimo</label>
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Math.max(MIN_PRICE, Number.parseInt(e.target.value) || 0), priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Máximo</label>
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Math.min(MAX_PRICE, Number.parseInt(e.target.value) || MAX_PRICE)])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                className="flex-1"
              />
              <span className="text-sm font-medium text-foreground">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
          </div>

          {/* Sort and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="rating">Calificación</option>
              </select>
            </div>
            {(selectedCategorySlug !== "all" || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
              <button
                onClick={() => {
                  setSelectedCategorySlug("all")
                  setPriceRange([MIN_PRICE, MAX_PRICE])
                }}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Section Title and Results Count */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trabajos Disponibles</h2>
            <span className="text-sm text-muted-foreground">{filteredProducts.length} Trabajos</span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                 <ProductCard
                   key={product.id}
                   product={{
                       ...product,
                       images: product.images,
                       seller_id: product.seller_id,
                       // El resto de campos de Product vienen en el spread
                   }}
                   seller={{
                       id: product.seller_id,
                       name: product.sellerName,
                       avatar: product.seller_avatar // Pasamos el avatar del seller para la tarjeta
                   }}
                 />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}