import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function GET() { 
  try {
    console.log("Stripe API Key:", process.env.STRIPE_SECRET_KEY ? "Exists" : "Missing");
    
    // Fetch all active products
    const products = await stripe.products.list({ 
      active: true, 
      limit: 100
    });
    
    console.log("Products fetched:", products.data.length);
    
    if (!products.data || !Array.isArray(products.data)) {
      console.error("Invalid products data:", products);
      return Response.json({ error: "Invalid products data" }, { status: 500 });
    }

    // Helper function to add delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Fetch prices for each product with delay to avoid rate limiting
    const productsWithPrices = [];
    for (const product of products.data) {
      try {
        // Add a delay between requests
        await delay(100);
        
        const prices = await stripe.prices.list({ product: product.id });
        productsWithPrices.push({
          ...product,
          prices: prices.data, // Attach prices to the product
        });
      } catch (error) {
        console.error(`Error fetching prices for product ${product.id}:`, error);
        // Add product with empty prices array to avoid breaking the UI
        productsWithPrices.push({
          ...product,
          prices: [],
        });
      }
    }
    
    console.log("Products with prices:", productsWithPrices.length);

    return Response.json(productsWithPrices, { status: 200 });
  } catch (error) {
    console.error("Error in getRentalProducts:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
