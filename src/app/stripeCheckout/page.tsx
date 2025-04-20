"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Link from 'next/link';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js";



const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Page() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
	  // when page loads, call the checkout api to initiate purchase
    // console.log(JSON.parse(localStorage.getItem("cart")));
    fetch("/api/stripeCheckout", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      // retrieve items in cart
      body: JSON.stringify(JSON.parse(localStorage.getItem("cart") as string))
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
    <div id="checkout">
		<h1>Product Purchase Page</h1>
		<Link href="/productList">See Products</Link>
      {clientSecret ? (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      ) : (
        <p>Loading checkout...</p>
      )}
    </div>
  );
}
