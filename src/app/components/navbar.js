"use client"

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * TODO
 * 
 * -replace emoji with actual logo
 * -create dropdown menu for mobile layout
 * 
 */

export default function Navbar(){
    const [cart, setCart] = useState([]);

    useEffect(()=> {
        // Retrieve cart from local storage on component mount
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        // Listen for changes in localStorage
        const handleStorageChange = () => {
            const updatedCart = localStorage.getItem("cart");
            setCart(updatedCart ? JSON.parse(updatedCart) : []);
        };
  
        window.addEventListener("storage", handleStorageChange);
  
        // Listen for a custom event to handle same-tab updates
        const handleCartUpdate = () => {
            const updatedCart = localStorage.getItem("cart");
            setCart(updatedCart ? JSON.parse(updatedCart) : []);
        };
  
        window.addEventListener("cartUpdated", handleCartUpdate);
  
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };

    }, []);

    return(
        <>
        
        <div id="topNavigation">

            <div id="titleLogoContainer">
                <h1 id="title">🛒</h1> {/* to be replaced with logo */}
                <h1 id="title">FakeStore</h1>
            </div>

            <div id="navLinks">

                <Link href="/">
                    <h2>Home</h2>
                </Link>

                <Link href="/products">
                    <h2>Products</h2>
                </Link>

                <Link href="/invoice">
                    <h2>Send Invoice</h2>
                </Link>
                
                {!cart || cart.length < 1 || cart == [] ? (
                    <></> /* don't allow user to access checkout with an empty cart */
                ) : (
                    <Link href="/checkout">
                        <h2>Checkout</h2>
                    </Link>
                )}
            
            </div>
        </div>
        </>
    );
}