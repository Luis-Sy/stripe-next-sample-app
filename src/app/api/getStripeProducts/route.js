import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function GET() { 
  try {
    // Fetch all active products and attach prices to each one
    let productsWithPrices = [];
    const products = await stripe.products.list({ active: true, limit: 10 }).autoPagingEach(
      async (product) => {
        // Fetch prices for each product
        const prices = await stripe.prices.list({ product: product.id });
        productsWithPrices.push({
          ...product,
          prices: prices.data, // Attach prices to the product
        });
      }
    );


    return Response.json(productsWithPrices, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
