"use client"

import { useState, useMemo } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

const products = [
  {
    id: 1,
    name: "Diseño Web Pro",
    category: "diseño-web",
    price: 2549.99,
    image: "/macbook-pro-16-2-silver.jpg",
    rating: 5,
    reviews: 24,
  },
  {
    id: 2,
    name: "Diseño Web Studio",
    category: "diseño-web",
    price: 1899.99,
    image: "/macbook-pro-16-2-keyboard-view.jpg",
    rating: 4,
    reviews: 18,
  },
  {
    id: 3,
    name: "Diseño Gráfico Master",
    category: "diseño-grafico",
    price: 3249.99,
    image: "/macbook-pro-16-2-colorful-display.jpg",
    rating: 5,
    reviews: 32,
  },
  {
    id: 4,
    name: "Diseño Gráfico Plus",
    category: "diseño-grafico",
    price: 2099.99,
    image: "/macbook-pro-16-2-side-view.jpg",
    rating: 5,
    reviews: 28,
  },
  {
    id: 5,
    name: "Fotografía Pro 4K",
    category: "fotografia",
    price: 1799.99,
    image: "/macbook-pro-16-2-silver.jpg",
    rating: 4,
    reviews: 15,
  },
  {
    id: 6,
    name: "Fotografía Studio Elite",
    category: "fotografia",
    price: 2399.99,
    image: "/macbook-pro-16-2-keyboard-view.jpg",
    rating: 5,
    reviews: 22,
  },
  {
    id: 7,
    name: "Ilustración Digital Max",
    category: "ilustracion-digital",
    price: 1599.99,
    image: "/macbook-pro-16-2-colorful-display.jpg",
    rating: 4,
    reviews: 19,
  },
  {
    id: 8,
    name: "Ilustración Digital Premium",
    category: "ilustracion-digital",
    price: 2849.99,
    image: "/macbook-pro-16-2-side-view.jpg",
    rating: 5,
    reviews: 26,
  },
]

const categories = [
  { id: "diseño-web", label: "Diseño Web" },
  { id: "diseño-grafico", label: "Diseño Gráfico" },
  { id: "fotografia", label: "Fotografía" },
  { id: "ilustracion-digital", label: "Ilustración Digital" },
]

export default function CategoriesPage() {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 4000])
  const [sortBy, setSortBy] = useState("relevance")

  const toggleWishlist = (id: number) => {
    const newWishlist = new Set(wishlist)
    if (newWishlist.has(id)) {
      newWishlist.delete(id)
    } else {
      newWishlist.add(id)
    }
    setWishlist(newWishlist)
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId)
    } else {
      newCategories.add(categoryId)
    }
    setSelectedCategories(newCategories)
  }

  const filteredProducts = useMemo(() => {
    let result = products

    // Filter by category
    if (selectedCategories.size > 0) {
      result = result.filter((p) => selectedCategories.has(p.category))
    }

    // Filter by price
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [selectedCategories, priceRange, sortBy])

  return (
    <main className="min-h-screen bg-background">
        <Header />
      {/* Banner */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold md:text-4xl leading-tight text-balance">
                Limited Time Offer: Save Big on Creative Tools!
              </h1>
              <div className="mt-6">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">Buy now</Button>
              </div>
            </div>

            <div className="flex justify-center items-center ">
              <img
                src="/modern-landing-page.png"
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
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategories.has(category.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-foreground hover:bg-gray-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Rango de Precio</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  max="4000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Math.max(0, Number.parseInt(e.target.value) || 0), priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">Máximo</label>
                <input
                  type="number"
                  min="0"
                  max="4000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Math.min(4000, Number.parseInt(e.target.value) || 4000)])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="4000"
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
            {(selectedCategories.size > 0 || priceRange[0] > 0 || priceRange[1] < 4000) && (
              <button
                onClick={() => {
                  setSelectedCategories(new Set())
                  setPriceRange([0, 4000])
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trabajos Destacados</h2>
            <span className="text-sm text-gray-600">{filteredProducts.length} Trabajos</span>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group">
                  {/* Product Card */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-4 relative transition-colors hover:bg-gray-100">
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-white transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={24}
                        className={wishlist.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </button>

                    {/* Product Image */}
                    <div className="flex items-center justify-center h-48 mb-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    {/* Category Badge */}
                    <div className="inline-block">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {categories.find((c) => c.id === product.category)?.label}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2">{product.name}</h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(product.rating)].map((_, i) => (
                          <span key={i} className="text-blue-500">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div>
                      <span className="font-bold text-foreground text-base md:text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Add to Bag Button */}
                    <button className="w-full border-2 border-foreground text-foreground py-2 px-4 rounded-full font-medium text-sm hover:bg-foreground hover:text-background transition-colors">
                      Add to bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
