"use client";
import { useEffect, useState } from "react";

export default function InvoicePage() {
    
    const currencies = [
        { value: "usd", label: "US Dollar (USD)" },
        { value: "eur", label: "Euro (EUR)" },
        { value: "gbp", label: "British Pound (GBP)" },
        { value: "jpy", label: "Japanese Yen (JPY)" },
        { value: "aud", label: "Australian Dollar (AUD)" },
        { value: "cad", label: "Canadian Dollar (CAD)" },
        { value: "chf", label: "Swiss Franc (CHF)" },
        { value: "cny", label: "Chinese Yuan (CNY)" },
        { value: "inr", label: "Indian Rupee (INR)" },
        { value: "brl", label: "Brazilian Real (BRL)" }
    ];

    const [statusMessage, setStatusMessage] = useState("");

    async function sendInvoice(event) {
        event.preventDefault(); // Prevent page reload

        setStatusMessage("Sending invoice, please wait..."); // display status to user

        const formData = new FormData(event.currentTarget);
        const customerName = formData.get("customer_name");
        const customerEmail = formData.get("customer_email");
        const amount = formData.get("amount");
        const currency = formData.get("currency");

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
            "currency": currency,
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
        <h1>Send an Invoice</h1>
        <div id="invoiceForm">
            <h2>Enter your credentials and amount below</h2>
            <form onSubmit={sendInvoice}>
            <input type="text" name="customer_name" placeholder="Full Name" required />
            <input type="email" name="customer_email" placeholder="Email" required />
            <input type="" name="amount" placeholder="0" min={0} step={0.1} required />
            <select name="currency" required>
                {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                    {currency.label}
                </option>
             ))}</select>
            <button type="submit">Send Invoice</button>
            </form>
            <h2>{statusMessage}</h2>
        </div>
    </div>
    );
}