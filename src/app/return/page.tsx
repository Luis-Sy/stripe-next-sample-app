"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Ensures hydration match

  useEffect(() => {
    setIsMounted(true); // Marks component as mounted
	if(sessionStorage.getItem("clientSecret")){
		// get the returned session id from the checkout sessions api call
		setSessionId(sessionStorage.getItem("clientSecret"));
	}
  localStorage.removeItem("cart"); // clear cart from local storage
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>; // Prevents hydration mismatch
  }

  return (
    <div>
      <h1>Purchase Successful!</h1>
      <p>Session ID: {sessionId || "Not found"}</p>
    </div>
  );
}