"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

export default function InvoicePage() {
    
    const [statusMessage, setStatusMessage] = useState("");

    async function sendInvoice(event) {
        event.preventDefault(); // Prevent page reload

        setStatusMessage("Sending invoice, please wait..."); // display status to user

        const formData = new FormData(event.currentTarget);
        const customerName = formData.get("customer_name");
        const customerEmail = formData.get("customer_email");
        const amount = formData.get("amount");

        try {
        const res = await fetch("/api/createInvoice", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            "customerName": customerName,
            "customerEmail": customerEmail,
            "amount": parseFloat(amount), // Ensure amount is a number
            }),
        });

        const data = await res.json();
        if (res.ok) {
            setStatusMessage("Invoice successfully created, redirecting to payment page...");
            window.location.href = data.invoiceUrl; // Redirect to the generated invoice page
        } else {
            console.error("Error creating invoice:", data);
            // display error message to user
            setStatusMessage("Error creating invoice. Please try again.");
        }
        } catch (error) {
        console.error("Error:", error);
        }
    }

    return (
        <div>
        <Navbar />
        <h1>Send an Invoice</h1>
        <div id="invoiceForm">
            <h2>Enter your credentials and amount below</h2>
            <form onSubmit={sendInvoice}>
            <input type="text" name="customer_name" placeholder="Full Name" required />
            <input type="email" name="customer_email" placeholder="Email" required />
            <input type="number" name="amount" placeholder="0" min={0} required />
            <button type="submit">Send Invoice</button>
            </form>
            <h2>{statusMessage}</h2>
        </div>
    </div>
    );
}