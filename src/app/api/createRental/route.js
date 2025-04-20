import { createRentalAndInvoice } from './createRental.js';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);
    const { userId, stripeProducts, customerInfo } = body;

    if (!stripeProducts || !Array.isArray(stripeProducts) || stripeProducts.length === 0) {
      return Response.json({ error: "Invalid or missing stripeProducts array" }, { status: 400 });
    }

    const result = await createRentalAndInvoice(
      userId || 0, // Use 0 for guest users
      stripeProducts,
      customerInfo || {} // Pass customer info if available
    );

    console.log("Rental invoice created successfully:", result);
    return Response.json({ 
      invoiceUrl: result.invoiceUrl,
      customerId: result.customerId
    });
  } catch (error) {
    console.error("Rental Invoice Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}