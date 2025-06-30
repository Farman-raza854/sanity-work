import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export async function POST(request: Request) {
  try {
    const { cartItems, customerInfo } = await request.json() as {
      cartItems: CartItem[];
      customerInfo?: {
        email?: string;
        name?: string;
        address?: string;
        phone?: string;
      };
    };

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = cartItems.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart`,
      customer_email: customerInfo?.email,
      metadata: {
        customerName: customerInfo?.name || '',
        customerPhone: customerInfo?.phone || '',
        customerAddress: customerInfo?.address || '',
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
      },
      billing_address_collection: 'required',
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}