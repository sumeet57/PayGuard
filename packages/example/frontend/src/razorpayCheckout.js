// PayGuard's docs don't publish the exact shape of what shoppingAgent.pay()
// or payguard.approvals.approve() return — they just show
// `console.log("Payment Result:", result)`. So this checks a handful of
// plausible field names for a Razorpay order id rather than assuming one.
// If none match, the caller should show the raw JSON so the real field name
// can be identified and added here.
export function findOrderId(result) {
  if (!result || typeof result !== "object") return null;
  return (
    result.razorpayOrderId ||
    result.orderId ||
    result.order_id ||
    result.order?.id ||
    result.data?.orderId ||
    result.data?.razorpayOrderId ||
    result.data?.order?.id ||
    result.transaction?.razorpayOrderId ||
    null
  );
}

function findAmountInPaise(result) {
  if (!result || typeof result !== "object") return undefined;
  // Razorpay's own order object reports amount already in paise.
  if (result.order?.amount) return result.order.amount;
  if (result.data?.order?.amount) return result.data.order.amount;
  // Everything else in these APIs is quoted in rupees, so convert.
  const rupees = result.amount ?? result.data?.amount ?? result.transaction?.amount;
  return rupees ? Math.round(rupees * 100) : undefined;
}

function findCurrency(result) {
  return result?.order?.currency || result?.data?.order?.currency || result?.currency || "INR";
}

// Statuses where the transaction isn't actually payable yet (still waiting
// on human review, or already stopped) — don't try to open Checkout for these.
const NON_PAYABLE_STATUSES = new Set(["REQUIRE_APPROVAL", "BLOCKED", "ERROR", "REJECTED"]);

export function isPayable(result) {
  if (!result) return false;
  const status = (result.status || result.data?.status || "").toUpperCase();
  return !NON_PAYABLE_STATUSES.has(status);
}

export function openRazorpayCheckout({ razorpayKeyId, result, description, onResult }) {
  const orderId = findOrderId(result);
  if (!orderId) {
    onResult({ type: "error", text: "Couldn't find an order id in PayGuard's response — see raw result below." });
    return;
  }
  if (typeof window.Razorpay === "undefined") {
    onResult({ type: "error", text: "Razorpay checkout script hasn't loaded — refresh and try again." });
    return;
  }

  const rzp = new window.Razorpay({
    key: result?.razorpayKeyId || result?.data?.razorpayKeyId || razorpayKeyId,
    amount: findAmountInPaise(result),
    currency: findCurrency(result),
    order_id: orderId,
    name: "PayGuard Buildathon Demo",
    description,
    theme: { color: "#16211f" },
    handler: () => onResult({ type: "success", text: "Payment completed (test mode)." }),
  });
  rzp.on("payment.failed", (response) => {
    onResult({ type: "error", text: response.error?.description || "Payment failed." });
  });
  rzp.open();
}