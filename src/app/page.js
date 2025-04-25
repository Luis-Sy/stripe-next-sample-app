"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    
    setIsMounted(true); // Ensures component is fully mounted before fetching data
    setCart(localStorage.getItem("cart"));
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
          {cart.length < 0 ? (
              <></> /* don't allow user to access checkout with an empty cart */
          ) : (
            <Link href="/checkout">
                <h2 id="checkoutLink">Checkout</h2>
            </Link>
          )}
            <Link href="/invoice">
                <h2 id="invoiceLink">Send Invoice</h2>
            </Link>
      </div>
      
      
      {products ? (
        <div id="productDisplayList">
          {products.map((product) => (
              <div key={product.id} id="productDisplay">
                <h2 id="productName">{product.name}</h2>
                {product.images.length > 0 && (
                  <Link href={`/productView/${product.id}`}>
                    <Image src={product.images[0]} alt={product.name} width={300} height={300}/>
                  </Link>
                )}
                <h2>${product.prices[0]?.unit_amount / 100}</h2>
                <p>{product.description}</p>
                <p>Collection: {product.metadata.Collection}</p>
                <p>Category: {product.metadata.Category}</p>
                <p>Designer: {product.metadata.Designer}</p>
                <p>Material: {product.metadata.Material}</p>
              </div>
          ))}
        </div>
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
}