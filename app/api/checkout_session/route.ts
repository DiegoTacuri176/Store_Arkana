import { NextResponse, type NextRequest } from "next/server"
import { getServerAuth } from "@/lib/auth"
import { Database } from "@/lib/db"
import Stripe from "stripe"

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover", 
})

export async function POST(req: NextRequest) {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay items en el carrito" }, { status: 400 })
    }

    const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    
    const newOrder = await Database.createOrder({
        buyerId: user.id,
        items: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        status: 'pending'
    })

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
  
          images: item.images && item.images.length > 0 ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const origin = req.headers.get("origin") || "http://localhost:3000"
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      
      success_url: `${origin}/orders/${newOrder.id}?success=true`, 
      cancel_url: `${origin}/cart?canceled=true`,
      customer_email: user.email,
      metadata: {
        orderId: newOrder.id,
        userId: user.id,
      },
    })

    

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Error interno al crear la sesión de pago" },
      { status: 500 }
    )
  }
}