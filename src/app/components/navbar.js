"use client"

import Link from "next/link";

/**
 * TODO
 * 
 * -replace emoji with actual logo
 * -create dropdown menu for mobile layout
 * 
 */

export default function Navbar(){
    return(
        <>
        
        <div id="topNavigation">

            <div id="titleLogoContainer">
                <h1 id="title">🛒</h1>
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
                
                {!localStorage.getItem("cart") || localStorage.getItem("cart").length < 1 ? (
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