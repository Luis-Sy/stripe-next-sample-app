import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function GET() { 
  try {
    // Fetch all active products
    const products = await stripe.products.list({ active: true, limit: 100 });

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
