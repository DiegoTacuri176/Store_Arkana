import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

// ✅ GET /api/orders/[id] - Obtener un solo pedido con sus items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Obtener pedido base
    const results = await query(
      `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       WHERE o.id = ?`,
      [id]
    )

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const order: any = results[0]

    // Obtener items del pedido
    const items = await query(
      `SELECT oi.*, 
              p.title AS product_title, 
              p.images AS product_images,
              u.name AS seller_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN users u ON oi.seller_id = u.id
       WHERE oi.order_id = ?`,
      [id]
    )

    order.items = items

    // Si shipping_address está en JSON string, parsearlo
    if (typeof order.shipping_address === "string") {
      try {
        order.shipping_address = JSON.parse(order.shipping_address)
      } catch {
        // Ignorar error si ya está parseado
      }
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error("❌ Error al obtener pedido:", error)
    return NextResponse.json(
      { error: "Error interno al obtener pedido" },
      { status: 500 }
    )
  }
}

// ✅ PUT /api/orders/[id] - Actualizar estado del pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "El campo 'status' es requerido" },
        { status: 400 }
      )
    }

    await query("UPDATE orders SET status = ? WHERE id = ?", [status, id])

    const updatedOrder = await query("SELECT * FROM orders WHERE id = ?", [id])

    return NextResponse.json(updatedOrder[0])
  } catch (error: any) {
    console.error("❌ Error al actualizar pedido:", error)
    return NextResponse.json(
      { error: "Error interno al actualizar pedido" },
      { status: 500 }
    )
  }
}
