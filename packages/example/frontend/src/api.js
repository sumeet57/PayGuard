const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(ADMIN_KEY ? { "x-admin-key": ADMIN_KEY } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  }
  return data;
}

export const api = {
  getConfig: () => request("/api/config"),
  updatePolicy: (policy) =>
    request("/api/policy", { method: "PUT", body: JSON.stringify(policy) }),
  sendPrompt: (prompt) =>
    request("/api/agent/prompt", { method: "POST", body: JSON.stringify({ prompt }) }),
  getPendingApprovals: () => request("/api/approvals/pending"),
  actOnApproval: (approvalId, action, reason) =>
    request("/api/approvals/action", {
      method: "POST",
      body: JSON.stringify({ approvalId, action, reason }),
    }),
  createOrder: (amount, itemId) =>
    request("/api/payment/order", { method: "POST", body: JSON.stringify({ amount, itemId }) }),
  verifyPayment: (payload) =>
    request("/api/payment/verify", { method: "POST", body: JSON.stringify(payload) }),
};

export { BASE_URL };