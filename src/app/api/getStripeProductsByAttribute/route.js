import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function POST(req) { 
  try {
    const { attribute, value } = await req.json();
    
    // Fetch all products and filter by the requested attribute and value
    const products = await stripe.products.list({ active: true, limit: 100 });
    
    const matchingProducts = products.data.filter(product => {
      // Check in metadata first
      if (product.metadata && product.metadata[attribute] === value) {
        return true;
      }
      
      // Then check direct properties
      return product[attribute] === value;
    });
    
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
