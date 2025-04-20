import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function GET(req, {params}) { 
  try {
    const { id } = params;
    const product = await stripe.products.retrieve(id);
    
    // Fetch prices for the product
    const prices = await stripe.prices.list({ product: id });
    
    // Attach prices to the product
    const productWithPrices = {
      ...product,
      prices: prices.data,
    };
    
    return Response.json(productWithPrices, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
