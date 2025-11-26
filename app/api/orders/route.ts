// app/api/orders/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"
import { v4 as uuidv4 } from "uuid"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerId, items, total, paymentMethod, shippingAddress } = body

    if (!buyerId || !items?.length || !total) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (buyerId, items, total)" },
        { status: 400 }
      )
    }

    const orderId = uuidv4()

    await query(
      `INSERT INTO orders (id, buyer_id, total, payment_method, shipping_address, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [orderId, buyerId, total, paymentMethod, JSON.stringify(shippingAddress)]
    )

    for (const item of items) {
      const itemId = uuidv4()
      await query(
        `INSERT INTO order_items (id, order_id, product_id, seller_id, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, orderId, item.productId, item.sellerId, item.quantity, item.price]
      )
    }

    const results = await query("SELECT * FROM orders WHERE id = ?", [orderId])
    const newOrder: any = results[0]

    const orderItems = await query(
      `SELECT oi.*, 
              p.title AS product_title, 
              p.images AS product_images, 
              u.name AS seller_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN users u ON oi.seller_id = u.id
       WHERE oi.order_id = ?`,
      [orderId]
    )

    newOrder.items = orderItems

    if (typeof newOrder.shipping_address === "string") {
      try {
        newOrder.shipping_address = JSON.parse(newOrder.shipping_address)
      } catch {
        
      }
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error: any) {
    console.error("❌ Error al crear pedido:", error)
    return NextResponse.json(
      { error: "Error interno al crear pedido" },
      { status: 500 }
    )
  }
}
