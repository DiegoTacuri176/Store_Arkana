import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializa el cliente de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover", // Asegurarse de usar la versión correcta
});

export async function POST(request: NextRequest) {
  try {
    const { cartItems, userId } = await request.json();

    if (!cartItems || cartItems.length === 0 || !userId) {
      return NextResponse.json({ error: "Faltan datos del carrito o usuario" }, { status: 400 });
    }

    // --- 1. CREAR UNA VERSIÓN LIGERA DEL CARRITO PARA METADATOS ---
    // Esto resuelve el error 500, ya que Stripe limita los metadatos a 500 caracteres.
    const lightCart = cartItems.map((item: any) => ({
      productId: item.product.id,
      sellerId: item.product.sellerId, // Necesario para crear OrderItem en el Webhook
      quantity: item.quantity,
      price: item.product.price, // Guardamos el precio validado para asegurar la orden
    }));
    // -----------------------------------------------------------------

    // 2. Mapear items del carrito a Line Items de Stripe (aquí sí usamos datos completos para la UI de Stripe)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item: any) => {
      // El precio debe ser en la unidad más pequeña (ej. centavos/cêntimos)
      const priceInCents = Math.round(item.product.price * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.title,
            // Las imágenes pueden tener una URL larga, pero Stripe las maneja en los Line Items
            images: [item.product.images[0] || "https://placehold.co/100x100/A0A0A0/FFFFFF?text=Producto"],
            description: item.product.description, // Descripción completa solo en Line Item, no en Metadata
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Crear la sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?status=cancel`,
      
      // 4. GUARDAR SOLO EL CARRITO LIGERO EN METADATOS
      metadata: {
        userId: userId,
        // Usamos el carrito ligero para asegurar que no exceda el límite de 500 caracteres
        cartData: JSON.stringify(lightCart), 
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("❌ Error creating Stripe Checkout Session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}