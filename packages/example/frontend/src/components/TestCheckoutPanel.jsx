import { useState } from "react";
import { api } from "../api.js";

export default function TestCheckoutPanel({ razorpayKeyId, maxAmount }) {
  const [amount, setAmount] = useState(500);
  const [status, setStatus] = useState(null); // { type, text }
  const [paying, setPaying] = useState(false);

  async function pay() {
    setPaying(true);
    setStatus(null);
    try {
      const { order, requiresApproval } = await api.createOrder(Number(amount), "manual");

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay checkout script hasn't loaded yet — refresh and try again.");
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "PayGuard Buildathon Demo",
        description: "Test mode payment — no real money moves",
        theme: { color: "#16211f" },
        handler: async (response) => {
          try {
            const verification = await api.verifyPayment(response);
            setStatus({
              type: verification.success ? "success" : "error",
              text: verification.success
                ? `Payment verified (test mode).${
                    requiresApproval ? " Note: this amount is above your approval threshold." : ""
                  }`
                : "Payment could not be verified.",
            });
          } catch (err) {
            setStatus({ type: "error", text: err.message });
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      rzp.on("payment.failed", (response) => {
        setStatus({ type: "error", text: response.error?.description || "Payment failed." });
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="panel">
      <h2>Manual test payment</h2>
      <p className="hint">
        Opens Razorpay Checkout in test mode. Use card 4111 1111 1111 1111, any future expiry, any
        CVV — no real money moves.
      </p>

      <div className="field">
        <label htmlFor="test-amount">Amount</label>
        <div className="amount-input">
          <span>₹</span>
          <input
            id="test-amount"
            type="number"
            min="1"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="range-note">
          <span>Capped at current max limit</span>
          <span>₹{maxAmount}</span>
        </div>
      </div>

      <button
        className="btn secondary"
        onClick={pay}
        disabled={paying || !amount || Number(amount) > maxAmount || Number(amount) <= 0}
      >
        {paying ? "Opening checkout…" : "Pay with Razorpay (test)"}
      </button>

      {status && (
        <p className={status.type === "error" ? "inline-error" : "inline-success"}>
          {status.text}
        </p>
      )}
    </div>
  );
}
