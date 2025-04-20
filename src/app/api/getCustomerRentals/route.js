import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function POST(req) { 
  try {
    const body = await req.json();
    const { userId, customerId } = body;

    // If a userId is provided, look up the associated Stripe customer ID
    let stripeCustomerId = customerId;
    
    if (userId && !customerId) {
      // Look up the customer ID in the database using the user ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true }
      });

      if (!user || !user.stripeCustomerId) {
        return Response.json(
          { error: "No Stripe customer found for this user" }, 
          { status: 404 }
        );
      }

      stripeCustomerId = user.stripeCustomerId;
    }

    // Validate that we have a customer ID to work with
    if (!stripeCustomerId) {
      return Response.json(
        { error: "Customer ID is required" }, 
        { status: 400 }
      );
    }

    const invoices = await stripe.invoices.list({
        limit: 20,
        customer: stripeCustomerId
    })

    let rentals = [];

    for(let invoice of invoices.data){
        
        let lineitems = await stripe.invoices.listLineItems(invoice.id);
        
        for(let item of lineitems.data){
            // line items have a piece of metadata attached that contains the productId used when the invoice was created
            let image = await stripe.products.retrieve(item.metadata.productId);
            image = image.images[0];
            let rental = {
                productId: item.metadata.productId,
                description: item.description,
                price: item.amount,
                image: image,
                itemName: item.metadata.itemName,
                startDate: item.metadata.startDate,
                endDate: item.metadata.endDate,
                category: item.metadata.category
            };
            rentals.push(rental);
        }
    }

    return Response.json({ rentals, customerId: stripeCustomerId }, { status: 200 });
  } catch (error) {
    console.error("Error in getCustomerRentals:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
