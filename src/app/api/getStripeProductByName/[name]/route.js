import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function GET(req, {params}) { 
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    
    // Fetch all products and filter by name
    const products = await stripe.products.list({ active: true, limit: 100 });
    const matchingProducts = products.data.filter(product => 
      product.name.toLowerCase().includes(decodedName.toLowerCase())
    );
    
    // Fetch prices for matching products
    const productsWithPrices = await Promise.all(
      matchingProducts.map(async (product) => {
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
