import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, images, price, metadata } = body;

    const product = await stripe.products.create({
      name,
      description,
      images,
      metadata,
      default_price_data: {
        currency: 'usd',
        unit_amount: price * 100, // Convert to cents
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
} 