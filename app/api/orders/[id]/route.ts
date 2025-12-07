import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
  
    const { id } = await params

    const orders = await query(
      `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       WHERE o.id = ?`,
      [id]
    )

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const order = orders[0]

    const items = await query(
      `SELECT oi.*, 
              p.title AS product_title, 
              p.images AS product_images, 
              u.name AS seller_name,
              u.id AS seller_id
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN users u ON oi.seller_id = u.id
       WHERE oi.order_id = ?`,
      [id]
    )

    
    const processedItems = items.map((item: any) => ({
      ...item,
      product_images: typeof item.product_images === 'string' 
        ? JSON.parse(item.product_images) 
        : item.product_images || []
    }))

    const orderDetail = {
      ...order,
      items: processedItems
    }

    return NextResponse.json(orderDetail)

  } catch (error: any) {
    console.error("[API] Error fetching order details:", error)
    return NextResponse.json(
      { error: "Error interno al obtener el pedido" },
      { status: 500 }
    )
  }
}