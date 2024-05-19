import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from 'react-redux';
import { selectCurrentOrder } from "../features/order/orderSlice";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.

export default function StripeCheckout() {
  const currentOrder = useSelector(selectCurrentOrder)
  const makePayment=async()=>{
    const stripe = await loadStripe('pk_test_51PG12FSECwfOXKErfav2TrQ5UPyOyVLZCl6B7BdK6UqAiKo9iVn5sczAd5y91VGDKOJlV863LrrMswFFvQs7c82O00R1iqQDx2')
    const body={
      products:currentOrder,
      url:`order-success/${currentOrder.id}`,
    };
    const headers ={
      "Content-Type":"application/json",
    }
    const response = await fetch(`${window.location.origin}/api/create-checkout-session`,
    {
      method: "POST",
      headers:headers,
      body: JSON.stringify(body)
    })
    const session = await response.json()
    const result= stripe.redirectToCheckout({
      sessionId:session.id
    });
    if(result.error){
      console.log(result.error)
    }
  }

  useEffect(()=>{
    makePayment();
  },[])
  return <div></div>
}