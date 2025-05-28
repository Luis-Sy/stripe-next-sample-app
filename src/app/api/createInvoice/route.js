import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function POST(req) {
  try {

    const data = await req.json();

    console.log(data);

    const currency = data.currency || "cad"; // default to CAD if not provided

    const customer = await stripe.customers.create({
        name: data.customerName,
        email: data.customerEmail
    });

    const invoice = await stripe.invoices.create({
        customer: customer.id,
        auto_advance: false, // wait untill we manually finalize the invoice
        collection_method: "send_invoice",
        days_until_due: 7,
        currency: currency
    });

    await stripe.invoiceItems.create({
        customer: customer.id,
        amount: data.amount * 100, // amount in cents
        currency: currency,
        invoice: invoice.id
    });

    // Finalize the invoice manually after confirming items are attached
    await stripe.invoices.finalizeInvoice(invoice.id);
    const retrievedInvoice = await stripe.invoices.retrieve(invoice.id);
    const invoiceUrl = retrievedInvoice.hosted_invoice_url;
    

    return Response.json({ 
        // return the invoice URL to the frontend and redirect user to the page
        invoiceUrl: invoiceUrl
    }, {status: 200});
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
