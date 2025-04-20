import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let event;
  
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    // Verify webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      // For development without signature verification
      event = JSON.parse(body);
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Check if this is a rental payment
        if (session.metadata && session.metadata.type === 'rental') {
          // Update rental status in database (if you have a database)
          // For now, we'll just log the success
          console.log(`Rental payment succeeded for session: ${session.id}`);
          console.log(`Rental period: ${session.metadata.startDate} to ${session.metadata.endDate}`);
          console.log(`Duration: ${session.metadata.durationInDays} days`);
          
          // Here you would typically:
          // 1. Update the rental status in your database
          // 2. Send confirmation email to the customer
          // 3. Notify the admin about the new rental
        }
        
        console.log(`Payment succeeded for session: ${session.id}`);
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Handle successful payment intent
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
        
      case 'invoice.paid':
        const invoice = event.data.object;
        console.log(`Invoice paid: ${invoice.id}`);
        
        // Here you would typically:
        // 1. Update the rental status in your database
        // 2. Send confirmation email to the customer
        // 3. Notify the admin about the new rental
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log(`Invoice payment failed: ${failedInvoice.id}`);
        
        // Here you would typically:
        // 1. Update the rental status in your database
        // 2. Send notification to the customer about the failed payment
        // 3. Notify the admin about the failed payment
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
