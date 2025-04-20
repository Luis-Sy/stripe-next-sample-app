import { stripe, siteUrl } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function POST(req) {
  try {
    const { items, startDate, endDate } = await req.json();
    
    // Calculate rental duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Create line items for Stripe checkout
    const lineItems = items.map(item => ({
      price: item.price, // The Stripe price ID
      quantity: item.quantity || 1,
    }));
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/rentals/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/rentals`,
      metadata: {
        startDate,
        endDate,
        durationInDays,
        type: "rental"
      },
    });

    return Response.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
