"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
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
      <h1>Products</h1>
      <Link href="/checkout">
        <h2>Checkout</h2>
      </Link>
      {products ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
			<h2>{product.name}</h2>
              <p>{product.description}</p>
              {product.images.length > 0 && (
                <img src={product.images[0]} alt={product.name} width="150" />
              )}
              <h2>Price: ${product.prices[0]?.unit_amount / 100}</h2>
              <p>Price ID: {product.prices[0]?.id}</p>
			        <Link href={`/productList/${product.id}`}>View Details</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
}
