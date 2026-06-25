"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

type Props = {
  projectId: number;
  amount: number;
  selectedTier: number | "free" | null;
};

export default function PaypalButton({ 
  projectId, 
  amount, 
  selectedTier
}: Props) {

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "USD",
        disableFunding: "card",
      }}
    >
      <PayPalButtons
        style={{
          height: 32,
        }}
        createOrder={async () => {

          const token =
            localStorage.getItem("token");

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/create-paypal-order`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                amount,
                projectId: projectId,
                tierId:
                  selectedTier === "free"
                    ? null
                    : selectedTier,
              }),
            }
          );

          const data = await res.json();
          return data.orderId;
        }}

        onApprove={async (data) => {
          const token =
            localStorage.getItem("token");

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/capture-paypal-order`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: data.orderID,
                projectId: projectId,
                tierId:
                  selectedTier === "free"
                    ? null
                    : selectedTier,
                amount,
              }),
            }
          );
          
        }}
      />
    </PayPalScriptProvider>
  );
}