import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const amountInCents = Math.round(Number(amount) * 100);

    if (!amountInCents || amountInCents < 100) {
      return NextResponse.json(
        { error: "Minimum amount is $1.00 USD" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      // Explicit payment method types — card covers Apple Pay & Google Pay
      // Using explicit list instead of automatic_payment_methods so Apple Pay
      // is always included regardless of redirect-based method conflicts
      payment_method_types: [
        "card",      // covers Apple Pay, Google Pay, regular cards
        "us_bank_account",
        "cashapp",
        "link",
      ],
      metadata: {
        source: "robeanny_website",
        type: "donation",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
