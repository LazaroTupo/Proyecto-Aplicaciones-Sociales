"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

type Props = {
  projectId: string;
};

export default function PaypalButton({ projectId }: Props) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "USD",
        disableFunding: "card",
      }}
    >
      <PayPalButtons
        createOrder={async () => {
          const res = await fetch(
            "http://localhost:3001/payments/create-paypal-order",
            {
              method: "POST",
            }
          );

          const data = await res.json();

          return data.orderId;
        }}

        onApprove={async (data) => {

          const token = localStorage.getItem("token");
          
          const res = await fetch(
            "http://localhost:3001/payments/capture-paypal-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: data.orderID,
                projectId: projectId
              }),
            }
          );

          const payment = await res.json();

          console.log(payment);
        }}
      />
    </PayPalScriptProvider>
  );
}