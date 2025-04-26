"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    
    setIsMounted(true); // Ensures component is fully mounted before fetching data
    fetch("/api/getStripeProducts", {method: "GET"})
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>; // Ensures server and client renders match
  }

  return (
    <div>
      <h1>Product List</h1>
      <div id="topNavigation">
          {!localStorage.getItem("cart") || localStorage.getItem("cart").length < 1 ? (
              <></> /* don't allow user to access checkout with an empty cart */
          ) : (
            <Link href="/checkout">
                <h2>Checkout</h2>
            </Link>
          )}
            <Link href="/invoice">
                <h2>Send Invoice</h2>
            </Link>
      </div>
      
      {/* Display fetched products in a grid format */}
      {products ? (
        <div id="productDisplayList">
          {products.map((product) => (
              <div key={product.id} id="productDisplay">
                <h2 id="productName">{product.name}</h2>
                {product.images.length > 0 && ( 
                  /* The first image of the product will be displayed and act as a link to it's detailed view page */
                  <Link href={`/productView/${product.id}`}>
                    <Image src={product.images[0]} alt={product.name} width={300} height={300}/>
                  </Link>
                )}
                <h2 id="priceDisplay">${product.prices[0]?.unit_amount / 100}</h2>
                {/* The entries below can be freely changed to any metadata you may have on your own stripe products */}
                <h3>{product.metadata.Collection}'s Collection</h3>
                <h3>{product.metadata.Category}</h3>
              </div>
          ))}
        </div>
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
}