"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getAdminProductsAction } from "@/lib/actions"; 

// Extendemos el tipo para incluir sellerName, ya que el Server Action lo añade
interface ProductWithSellerName extends Product {
    sellerName?: string
}

// Define el tipo para rastrear la acción de carga específica (ID y tipo)
type ActionLoadingState = {
    id: string; 
    type: 'approve' | 'reject';
} | null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithSellerName[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null); // Estado para rastrear producto y tipo de acción
  const router = useRouter();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Modificamos loadProducts para usar el Server Action
  const loadProducts = useCallback(async () => {
    try {
      // 1. Llamar al Server Action para obtener datos serializados
      const productsData = await getAdminProductsAction();
      setProducts(productsData);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    
    // Al inicio, cargamos los productos usando el nuevo método
    loadProducts();
  }, [router, loadProducts]);
  
  // Función centralizada para actualizar el estado del producto
  const updateProductStatus = async (productId: string, status: "approved" | "rejected", successMessage: string) => {
    // 1. Iniciar la acción de carga específica
    setActionLoading({ id: productId, type: status === 'approved' ? 'approve' : 'reject' });

    try {
      // 2. Actualizar en la DB (Usamos el API Route para el update)
      const res = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Error al actualizar estado del producto");
      
      // 3. Mostrar la notificación
      if (status === 'approved') {
          toast.success(successMessage);
      } else {
          toast.error(successMessage);
      }
      
      // 4. Esperar a que el toast sea visible (ej. 500ms)
      await sleep(500); 
      
      // 5. Recargar productos y actualizar la UI
      await loadProducts();
      
    } catch (error) {
      console.error(`Error al actualizar producto ${productId}:`, error);
      toast.error("Error al procesar la acción. Intenta de nuevo.");
    } finally {
      setActionLoading(null); // 6. Finalizar la acción de carga
    }
  };

  const handleApprove = async (productId: string) => {
    await updateProductStatus(productId, "approved", 'Trabajo Aprobado. ¡Notificado al vendedor!');
  };
  
  const handleReject = async (productId: string) => {
    await updateProductStatus(productId, "rejected", 'Trabajo Rechazado. ¡Notificado al vendedor!');
  };
  
  
  const pendingProducts = products.filter((p) => p.status === "pending");
  const approvedProducts = products.filter((p) => p.status === "approved");
  const rejectedProducts = products.filter((p) => p.status === "rejected");

  const ProductTable = ({ products }: { products: ProductWithSellerName[] }) => {
    
    const isProcessingAny = !!actionLoading; 

    return (
    <Table>
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
        {products.map((product) => {
            // Lógica para determinar el estado de carga y acción
            const isProcessingThisItem = actionLoading?.id === product.id;
            const isApproving = isProcessingThisItem && actionLoading?.type === 'approve';
            const isRejecting = isProcessingThisItem && actionLoading?.type === 'reject';

            return (
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
                    {/* Botón Ver - Deshabilitado si cualquier acción está en curso */}
                    <Button variant="outline" size="sm" asChild disabled={isProcessingAny}>
                      <Link href={`/products/${product.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {product.status === "pending" && (
                      <>  
                        {/* Botón APROBAR */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(product.id)}
                          // Deshabilita solo si este producto está siendo procesado
                          disabled={isProcessingThisItem} 
                          className="group/btn"
                        >
                          {isApproving ? ( // Muestra spinner SÓLO si es la acción de aprobar para este ID
                            <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500 group-hover/btn:text-green-600 transition-colors" />
                          )}
                        </Button>
                        {/* Botón RECHAZAR */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(product.id)}
                           // Deshabilita solo si este producto está siendo procesado
                          disabled={isProcessingThisItem} 
                          className="group/btn"
                        >
                           {isRejecting ? ( // Muestra spinner SÓLO si es la acción de rechazar para este ID
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 group-hover/btn:text-red-600 transition-colors" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
        })}
      </TableBody>
    </Table>
  );
}

  if (loading) {
    return (
      // Corrección de centrado del cargador
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground mt-4">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
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
      
      <div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </div>
  );
}