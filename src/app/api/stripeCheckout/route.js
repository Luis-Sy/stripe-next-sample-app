import { stripe, siteUrl } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export async function POST(req) {
  try {
    let items = await req.json();
    
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: items, // Use the parsed JSON body
      mode: "payment",
      return_url: `${siteUrl}/return`,
    });

    return Response.json({ clientSecret: session.client_secret }, {status: 200});
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
