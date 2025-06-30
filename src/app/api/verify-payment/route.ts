import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_details: session.customer_details,
          payment_status: session.payment_status,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}