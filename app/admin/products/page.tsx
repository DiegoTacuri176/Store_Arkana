"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "@/lib/db";
import { AuthService } from "@/lib/auth";
import type { Product } from "@/lib/types";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const notify = () => toast("Here is your toast.");

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }

    // Usamos el objeto toast correctamente

    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await Database.getProducts();

      // Añadiendo nombre del vendedor
      const productsWithSellers = await Promise.all(
        allProducts.map(async (product) => {
          // Tu corrección previa de seller_id se mantiene aquí
          const seller = await Database.getUser(product.seller_id);
          console.log("Productos con vendedores cargados:", product.created_at);

          return {
            ...product,
            sellerName: seller?.name || "Desconocido",
          };
        })
      );

      setProducts(productsWithSellers);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // crear una function que redirija a /admin/
  
  
  
  const handleApprove = async (productId: string) => {
    toast.success('Aprobado!')
    await Database.updateProduct(productId, { status: "approved" });
    loadProducts();
    // esperar a que el toast se muestre antes de recargar
  };
  
  const handleReject = async (productId: string) => {
    toast.error('Rechazado!')
    await Database.updateProduct(productId, { status: "rejected" });
    loadProducts();
    // esperar a que el toast se muestre antes de redendigir a dashboard
  };
  const handleGoBack = () => {
    router.push("/admin");
  };
  
  const pendingProducts = products.filter((p) => p.status === "pending");
  const approvedProducts = products.filter((p) => p.status === "approved");
  const rejectedProducts = products.filter((p) => p.status === "rejected");

  const ProductTable = ({ products }: { products: Product[] }) => (
    <Table>
      {/* 3. IMPORTANTE: Quité el <Toaster /> de aquí porque rompía la tabla */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Imagen</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="w-[200px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{product.title}</TableCell>
            <TableCell>{product.sellerName ?? "Desconocido"}</TableCell>
            <TableCell>${product.price}</TableCell>
            <TableCell>
              {product.status === "approved" && (
                <Badge className="bg-green-500">Aprobado</Badge>
              )}
              {product.status === "pending" && (
                <Badge variant="secondary">Pendiente</Badge>
              )}
              {product.status === "rejected" && (
                <Badge variant="destructive">Rechazado</Badge>
              )}
            </TableCell>
            <TableCell>
              {product.created_at
                ? new Date(product.created_at).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/products/${product.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {product.status === "pending" && (
                  <>  
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(product.id)}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(product.id)}
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">
            Gestión de Trabajos
          </h1>
          <p className="text-muted-foreground">
            Revisa y gestiona todos los trabajos publicados
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Pendientes ({pendingProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Aprobados ({approvedProducts.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rechazados ({rejectedProducts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  {pendingProducts.length > 0 ? (
                    <ProductTable products={pendingProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos pendientes de revisión
                      <button onClick={handleGoBack}>
                        click here
                      </button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved">
                  {approvedProducts.length > 0 ? (
                    <ProductTable products={approvedProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos aprobados
                      
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rejected">
                  {rejectedProducts.length > 0 ? (
                    <ProductTable products={rejectedProducts} />
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No hay trabajos rechazados
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* 4. IMPORTANTE: Coloca el Toaster al final del contenedor principal */}
      <div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </div>
  );
}
