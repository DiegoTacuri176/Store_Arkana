// app/api/webhooks/stripe/route.ts
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { query } from "@/lib/server/mysql"; 
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

// Desactiva el parseo automático de body para la verificación de firma
export const dynamic = 'force-dynamic' 
export const runtime = 'nodejs' 

export const config = {
  api: {
    bodyParser: false, // Importantísimo para verificar el webhook
  },
};

export async function POST(request: NextRequest) {
  // Obtener el body como texto sin parsear para la verificación de firma
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  
  if (!signature) {
    return new NextResponse("Firma de Stripe faltante", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // 1. Verificar la firma del Webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string 
    );
  } catch (error: any) {
    console.error("❌ Error de verificación de Webhook:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // 2. Manejar el evento de pago exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // 3. Extraer metadatos y asegurar que existan
      const userId = session.metadata?.userId;
      const cartDataString = session.metadata?.cartData;
      
      if (!userId || !cartDataString) {
        console.error("❌ Webhook: Faltan metadatos cruciales (userId o cartData)");
        return new NextResponse("Faltan metadatos necesarios", { status: 400 });
      }
      
      const cartItems: any[] = JSON.parse(cartDataString);
      
      const total = session.amount_total ? session.amount_total / 100 : 0; 

      // 4. Crear la orden en MySQL
      const orderId = uuidv4();
      
      // Inserción en la tabla orders. (Nota: shipping_address se inserta como NULL o lo puedes omitir si no es digital)
      await query(
          `INSERT INTO orders (id, buyer_id, total, payment_method, status)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, userId, total, "Stripe Checkout", "completed"] 
      );
      
      // Inserción en la tabla order_items
      for (const item of cartItems) {
          const itemId = uuidv4();
          await query(
              `INSERT INTO order_items (id, order_id, product_id, seller_id, quantity, price)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [itemId, orderId, item.product.id, item.product.sellerId, item.quantity, item.product.price]
          );
      }

      console.log(`🎉 Pedido ${orderId} creado exitosamente via Stripe Webhook`);

    } catch (dbError) {
      console.error("❌ Error al guardar el pedido en la BD:", dbError);
    }
  }

  // 5. Devolver 200 OK inmediatamente a Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}