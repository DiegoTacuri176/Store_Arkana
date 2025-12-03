import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

// 1. Eliminamos todas las importaciones visuales (Button, Card, Header, etc.)
// porque dan error en un archivo API.

interface RouteProps {
  params: Promise<{ id: string }>
}

// 2. En route.ts la función debe llamarse GET (o POST, PUT, etc.)
export async function GET(request: NextRequest, { params }: RouteProps) {
  
  // Esperamos a que los params se resuelvan
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // --- MANTENEMOS TU LÓGICA DE VALIDACIÓN ---

  // Obtenemos los pedidos
  const orderRes = await fetch(`${apiUrl}/api/orders?buyerId=${id}`, {
    cache: "no-store",
  });

  // Si falla la API interna
  if (!orderRes.ok) {
    // Opción A: Redirigir a una página de error 404
    // return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
    
    // Opción B (Lo que pides): Redirigir a pedidos aunque falle
    redirect('/pedidos?error=fetch_failed');
  }

  const orders = await orderRes.json()
  
  // Buscamos el pedido específico
  const order = orders.find((o: any) => o.id === id) || orders[0]

  if (!order) {
    // Si no existe la orden, redirigimos a pedidos con un flag de error (opcional)
    redirect('/pedidos?error=not_found');
  }

  // NOTA: Los cálculos de subtotal/tax son irrelevantes aquí porque
  // vamos a redirigir al usuario inmediatamente, no vamos a mostrar nada.
  
  // 3. LA REDIRECCIÓN FINAL
  // Si todo salió bien y la orden existe, redirigimos a la vista de pedidos.
  redirect('/pedidos');
}