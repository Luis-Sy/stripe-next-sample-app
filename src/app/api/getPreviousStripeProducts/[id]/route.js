import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function GET(req, {params}) { 
  try {
    // Fetch all active products starting before the queried one, functions as getting the previous 100 products before the queried one
    const { id } = await params;
    const products = await stripe.products.list({ active: true, limit: 100, ending_before: id });

    // Fetch prices for each product
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({ product: product.id });
        return {
          ...product,
          prices: prices.data, // Attach prices to the product
        };
      })
    );

    return Response.json(productsWithPrices, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
