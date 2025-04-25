"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function AddToCartButton(price){
    const [isMounted, setIsMounted] = useState(false); // Ensures hydration match
    const router = useRouter();
    // temp way of handling cart, likely replaced with backend mySQL solution in final product
     const addToCart = () =>{
    let items = JSON.parse(localStorage.getItem("cart"));
    if(!items){
      items = [];
    }
    let newProduct = {
      "price": price.price,
      "quantity": 1
    }
    // add the item to cart
    console.log(newProduct);
    items.push(newProduct);
    localStorage.setItem("cart", JSON.stringify(items));
    // return to product list after adding item to cart
    router.push("/")
    }
    useEffect(() =>{
      setIsMounted(true);
    },[])

    if(!isMounted){
        return <p>Loading...</p>
    }
    return(
        <button onClick={addToCart}>Add to Cart</button>
    )
}