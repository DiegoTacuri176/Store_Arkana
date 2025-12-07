import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const buyerId = searchParams.get("buyerId")
    const sellerId = searchParams.get("sellerId")

    let sql = `
      SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (buyerId) {
      sql += " AND o.buyer_id = ?"
      params.push(buyerId)
    }

    if (sellerId) {
      sql += ` AND o.id IN (
        SELECT DISTINCT order_id FROM order_items WHERE seller_id = ?
      )`
      params.push(sellerId)
    }

    sql += " ORDER BY o.created_at DESC"

    const orders: any[] = await query(sql, params)

    if (!orders || orders.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, 
                p.title AS product_title, 
                p.images AS product_images, 
                u.name AS seller_name
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN users u ON oi.seller_id = u.id
         WHERE oi.order_id = ?`,
        [order.id]
      )

      order.items = items

      
      if (typeof order.shipping_address === "string") {
        try {
          order.shipping_address = JSON.parse(order.shipping_address)
        } catch {

        }
      }
    }

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error("❌ Error al obtener pedidos:", error)
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    )
  }
}

// --------------------------------------------------------
// ELIMINACIÓN DE LA FUNCIÓN POST ANTIGUA:
// Antes, la función POST creaba la orden directamente aquí.
// Ahora, el cliente llama a /api/checkout_session (nuevo archivo)
// y el Webhook de Stripe crea la orden en la base de datos.
// Por lo tanto, eliminamos el método POST de esta API.
// --------------------------------------------------------

// Se eliminó la función export async function POST(request: NextRequest) {}
// La API de órdenes ahora solo soporta GET.

// El archivo termina aquí, sin el método POST.