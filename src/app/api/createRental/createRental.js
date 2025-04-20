import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function calculateRentalAmount(dailyRateInCents, quantity, startDate, endDate) {
  const dayInMs = 1000 * 60 * 60 * 24;
  // Convert string dates to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  const rentalDays = Math.ceil((end.getTime() - start.getTime()) / dayInMs);
  return (dailyRateInCents * quantity) * rentalDays;
}

export async function createRentalAndInvoice(userId, stripeProducts, customerInfo = {}) {
  let customerId;
  
  try {
    // Try to find the specified user from our database
    // Convert userId to string since Prisma expects string ID
    const userIdString = String(userId);
    const user = await prisma.user.findUnique({ where: { id: userIdString } });
    
    if (user) {
      // Get or create Stripe customer for existing user
      customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({ 
          email: user.email,
          name: user.name || customerInfo.name || 'Customer'
        });
        customerId = customer.id;
        await prisma.user.update({
          where: { id: userIdString },
          data: { stripeCustomerId: customerId },
        });
      } else if (customerInfo.name) {
        // Update existing customer with the name if provided
        await stripe.customers.update(customerId, {
          name: customerInfo.name
        });
      }
    } else {
      // For guest checkout, create a customer without attaching to a user
      const customer = await stripe.customers.create({ 
        email: customerInfo.email || 'guest@example.com',
        name: customerInfo.name || 'Guest Customer'
      });
      customerId = customer.id;
      console.log('Created guest customer ID:', customerId);
    }

    // retrieve the customer id from Stripe
    const customer = await stripe.customers.retrieve(customerId);

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: false, // do not finalize until invoice item is created
      collection_method: "charge_automatically",
      currency: "cad",
      // Add customer name to invoice metadata if available
      metadata: {
        customer_name: customer.name || customerInfo.name || 'Customer'
      }
    });

    console.log(`Invoice created with ID: ${invoice.id}`);

    // iterate through the cart and create invoice line items from each one
    for(let product of stripeProducts){
      // Fetch the Stripe price object
      console.log("Processing product:", product);
      const data = await stripe.products.retrieve(product.productId);
      const price = await stripe.prices.retrieve(product.priceId);
      if (!price.unit_amount) throw new Error("Price does not have an amount");

      const unitAmount = price.unit_amount; // in cents
      const totalAmount = calculateRentalAmount(unitAmount, product.quantity, product.startDate, product.endDate);

      console.log(`🔹 Calculated Rental Cost: $${(totalAmount / 100).toFixed(2)}`);
      console.log(`Price: ${price.unit_amount}`);

      // Create invoice item
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: totalAmount,
        currency: "cad",
        description: `Rental for product: ${(data.name)} ( x${product.quantity} ) for duration of: (${product.startDate} - ${product.endDate})`,
        invoice: invoice.id,
        metadata: {
          productId: product.productId,
          startDate: product.startDate,
          endDate: product.endDate,
          category: data.metadata.Category || 'Clothing',
          itemName: data.name
        }
      });

      console.log("Invoice Item Created:", data.name);
    }

    // Finalize the invoice manually after confirming items are attached
    await stripe.invoices.finalizeInvoice(invoice.id);
    const retrievedInvoice = await stripe.invoices.retrieve(invoice.id);
    const invoiceUrl = retrievedInvoice.hosted_invoice_url;
    
    if (!invoiceUrl) {
      throw new Error("Failed to get hosted invoice URL");
    }
    
    console.log("Invoice URL:", invoiceUrl);

    return {
      // return the hosted payment link to redirect to in the frontend
      invoiceUrl: invoiceUrl,
      customerId: customer.id
    };
  } catch (error) {
    console.error("Error creating rental and invoice:", error);
    throw error;
  }
}