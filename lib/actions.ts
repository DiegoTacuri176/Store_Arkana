'use server';

import { Database } from "./db";
import type { Product, User } from "./types";

interface ProductWithSellerName extends Product {
    sellerName?: string
}

export async function getAdminProductsAction(): Promise<ProductWithSellerName[]> {
  try {
    const allProducts = await Database.getProducts();

    const uniqueSellerIds = Array.from(new Set(allProducts.map(p => p.seller_id).filter(id => id)));
    
    const sellerPromises = uniqueSellerIds.map(id => Database.getUser(id));
    const sellers = await Promise.all(sellerPromises);
    const sellersMap = new Map<string, any>();
    sellers.forEach(seller => {
      if (seller) sellersMap.set(seller.id, seller);
    });

    const productsWithSellers: ProductWithSellerName[] = allProducts.map((product) => {
        const seller = sellersMap.get(product.seller_id);
        
        return {
            ...product,
            sellerName: seller?.name || "Desconocido",
            images: typeof product.images === "string" ? JSON.parse(product.images as string) : product.images,
        };
    });

    return productsWithSellers;
  } catch (error) {
    console.error("[Server Action] Error fetching admin products:", error);
    
    return []; 
  }
}
