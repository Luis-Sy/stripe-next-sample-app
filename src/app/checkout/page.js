"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "../components/navbar";
import Link from 'next/link';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js";


export default function Page() {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
	  // when page loads, call the checkout api to initiate purchase
    // console.log(JSON.parse(localStorage.getItem("cart")));

    // Dynamically load Stripe with env var
    const load = async () => {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      setStripePromise(stripe);
    };
    load();

    fetch("/api/stripeCheckout", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      // retrieve items in cart
      body: JSON.stringify(JSON.parse(localStorage.getItem("cart") || "[]"))
    })
      .then((res) => res.json())
      .then((data) => {
		  // store the retrieved secret in session storage
        setClientSecret(data.clientSecret);
		    sessionStorage.setItem("clientSecret", data.clientSecret);
      })
      .catch((err) => console.error("Error fetching client secret:", err));
  }, []);

  return (
    <>
    <Navbar />
    <div id="checkout">
		<h1>Checkout</h1>
      {clientSecret ? (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      ) : (
        <p>Loading checkout...</p>
      )}
    </div>
    </>
  );
}