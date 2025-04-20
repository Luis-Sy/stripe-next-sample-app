import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    const customerId = url.searchParams.get("customerId");
    const userId = url.searchParams.get("userId");

    if (!productId) {
      return new Response("Product ID is required", { status: 400 });
    }

    // Get the Stripe customer ID either directly or from the user ID
    let stripeCustomerId = customerId;
    
    if (userId && !customerId) {
      // Look up the customer ID in the database using the user ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true }
      });

      if (!user || !user.stripeCustomerId) {
        return new Response("No Stripe customer found for this user", { status: 404 });
      }

      stripeCustomerId = user.stripeCustomerId;
    }

    if (!stripeCustomerId) {
      return new Response("Customer ID is required", { status: 400 });
    }

    // Find the invoice for this customer that contains the product
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 20,
    });

    if (!invoices.data.length) {
      return new Response("No invoices found for this customer", { status: 404 });
    }

    // Find the invoice with the specific product
    let targetInvoice = null;
    for (const invoice of invoices.data) {
      const lineItems = await stripe.invoices.listLineItems(invoice.id);
      const hasProduct = lineItems.data.some(
        (item) => item.metadata.productId === productId
      );

      if (hasProduct) {
        targetInvoice = invoice;
        break;
      }
    }

    if (!targetInvoice) {
      return new Response("No invoice found for this product", { status: 404 });
    }

    // Redirect to invoice hosted URL
    return Response.redirect(targetInvoice.hosted_invoice_url);
    
    /* Alternative: Get the PDF directly (requires more implementation)
    const pdfInvoice = await stripe.invoices.retrievePdf(invoiceId);
    
    // Return PDF file
    return new Response(pdfInvoice, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`
      }
    });
    */
    
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return new Response("Error downloading invoice: " + error.message, {
      status: 500,
    });
  }
} 