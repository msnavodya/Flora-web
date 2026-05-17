import React, { useEffect, useMemo, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { capturePayPalOrder, createPayPalOrder, getPayPalConfig } from "../../api";

export default function PayPalButton({ items, currency = "USD", onSuccess, onError }) {
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadConfig = async (mountedRef) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getPayPalConfig();
      if (!mountedRef.current) {
        return;
      }
      setClientId(response.data?.clientId || "");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }
      setErrorMessage("PayPal is temporarily unavailable. Check backend Sandbox credentials and try again.");
      onError?.("PayPal configuration could not be loaded.");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };

    // Keep this config fetch one-shot. Repeated calls here usually mean
    // the parent component is re-mounting this button in a loop.
    loadConfig(mountedRef);

    return () => {
      mountedRef.current = false;
    };
  }, [onError]);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        id: String(item.id || item._id || item.name),
        name: item.name || "Plant",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })).filter((item) => item.price >= 0 && item.quantity > 0),
    [items]
  );

  if (loading) {
    return <p className="drawer-copy">Loading PayPal...</p>;
  }

  if (!clientId || errorMessage) {
    return (
      <div>
        <p className="drawer-copy">{errorMessage || "PayPal is not configured."}</p>
        <button type="button" className="pay-btn" onClick={() => loadConfig({ current: true })}>
          Retry PayPal
        </button>
      </div>
    );
  }

  if (normalizedItems.length === 0) {
    return <p className="drawer-copy">Add at least one item before using PayPal.</p>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency,
        intent: "capture",
        components: "buttons",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", label: "paypal", shape: "pill" }}
        createOrder={async () => {
          try {
            setErrorMessage("");
            const response = await createPayPalOrder({ items: normalizedItems, currency });
            return response.data.id;
          } catch (error) {
            const detail = error.response?.data?.detail;
            const message = typeof detail === "string" ? detail : "Unable to create PayPal order.";
            setErrorMessage(message);
            onError?.(message);
            throw error;
          }
        }}
        onApprove={async (data) => {
          try {
            setErrorMessage("");
            const response = await capturePayPalOrder(data.orderID);
            onSuccess?.(response.data);
          } catch (error) {
            const detail = error.response?.data?.detail;
            const message = typeof detail === "string" ? detail : "Unable to capture PayPal payment.";
            setErrorMessage(message);
            onError?.(message);
          }
        }}
        onError={(error) => {
          console.error("PayPal Checkout Error:", error);
          const message = "PayPal checkout failed. Please try again.";
          setErrorMessage(message);
          onError?.(message);
        }}
        onCancel={() => {
          const message = "PayPal checkout was cancelled.";
          setErrorMessage(message);
          onError?.(message);
        }}
      />

      {errorMessage ? <p className="drawer-copy">{errorMessage}</p> : null}
    </PayPalScriptProvider>
  );
}
