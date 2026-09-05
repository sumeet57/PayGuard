import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { AsyncLocalStorage } from "node:async_hooks";
import Razorpay from "razorpay";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, tool } from "langchain";
import { PayGuard, PayGuardAIProvider, RazorpayWebhookHandler } from "payguard";

dotenv.config();

// ---- required env, no hardcoded fallbacks ----
const REQUIRED = [
  "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
  "MONGO_URI", "PAYGUARD_API_KEY", "PAYGUARD_ENDPOINT", "GOOGLE_API_KEY",
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}. Copy .env.example to .env.`);
  process.exit(1);
}

// ---- frontend-adjustable policy (in memory) ----
const policy = {
  maxTransactionAmount: Number(process.env.DEFAULT_MAX_TRANSACTION_AMOUNT || 30000),
  requireApprovalAbove: Number(process.env.DEFAULT_REQUIRE_APPROVAL_ABOVE || 10000),
};

const CATALOG = [
  { id: "item_001", name: "Standard Office Mouse", price: 800 },
  { id: "item_002", name: "Developer Monitor 27-inch", price: 12500 },
  { id: "item_003", name: "Enterprise Server Rack", price: 45000 },
];

// Captures the raw result of shoppingAgent.pay() for the request currently
// being handled, so /api/agent/prompt can hand it back to the frontend
// alongside the LLM's natural-language reply. AsyncLocalStorage keeps this
// safe across concurrent requests (a plain module-level variable would leak
// between simultaneous prompts).
const requestContext = new AsyncLocalStorage();

// ---- CORS: locked to your deployed frontend's origin(s) ----
// Set FRONTEND_ORIGIN in .env to a comma-separated list, e.g.

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    "FRONTEND_ORIGIN is not set — CORS will reject all cross-origin requests. " +
    "Set it to your deployed frontend's URL(s), comma-separated."
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // requests with no Origin header (curl, server-to-server, webhooks) are allowed through
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use("/webhooks/razorpay", express.raw({ type: "application/json" }));
app.use(express.json());

// ---- Razorpay (test mode via env keys) ----
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---- PayGuard ----
const payguard = new PayGuard({
  razorpay: { keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET },
  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI,
    collectionName: "payguard_transactions",
  },
  policy, // mutated in place by PUT /api/policy below
  ai: new PayGuardAIProvider({
    apiKey: process.env.PAYGUARD_API_KEY,
  }),
});

const webhookHandler = new RazorpayWebhookHandler(payguard);
const shoppingAgent = await payguard.agent({
  id: "demo-shopping-agent",
  name: "Autonomous Shopping Agent",
  capabilities: ["e-commerce", "payments"],
});

// ---- LangChain v1 tool: built with the `tool()` helper, schema is Zod ----
const payguardTool = tool(
  async ({ amount, merchantId, reason }) => {
    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const result = await shoppingAgent.pay({
        amount,
        currency: "INR",
        merchant: { id: merchantId },
        reason,
        idempotencyKey,
      });
      requestContext.getStore()?.setLastPaymentResult(result);
      return JSON.stringify(result);
    } catch (err) {
      const errorResult = { status: "ERROR", message: err.message };
      requestContext.getStore()?.setLastPaymentResult(errorResult);
      return JSON.stringify(errorResult);
    }
  },
  {
    name: "execute_razorpay_payment",
    description: "Securely initiates a payment transaction through PayGuard's security SDK.",
    schema: z.object({
      amount: z.number().describe("Amount in INR"),
      merchantId: z.string().describe("Merchant Identifier"),
      reason: z.string().describe("Business reason for item purchase"),
    }),
  }
);

// ---- LLM (Gemini free-tier via @langchain/google-genai) + agent ----
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

const catalogJson = JSON.stringify(CATALOG, null, 2);

const agent = createAgent({
  model: llm,
  tools: [payguardTool],
  systemPrompt: `You are an autonomous purchasing agent equipped with PayGuard payment safety tools.
Available Inventory Catalog:
${catalogJson}

Select the requested inventory match. When purchasing, trigger 'execute_razorpay_payment' with merchantId 'merchant_buildathon_01'.`,
});

// ---- Optional admin auth for endpoints that change money-affecting state.
// Set ADMIN_API_KEY in .env to require this header on those routes; leave it
// unset to keep the endpoints open (fine for local dev, not for a public
// deployment).
function requireAdminKey(req, res, next) {
  if (!process.env.ADMIN_API_KEY) return next(); // not configured — allow through
  const provided = req.headers["x-admin-key"];
  if (provided !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, error: "Missing or invalid x-admin-key header." });
  }
  next();
}

// ---- config / policy endpoints (frontend surface) ----
app.get("/api/config", (req, res) => {
  res.json({ success: true, razorpayKeyId: process.env.RAZORPAY_KEY_ID, catalog: CATALOG, policy: { ...policy } });
});

app.put("/api/policy", requireAdminKey, (req, res) => {
  const { maxTransactionAmount, requireApprovalAbove } = req.body;
  if (typeof maxTransactionAmount !== "number" || typeof requireApprovalAbove !== "number") {
    return res.status(400).json({ success: false, error: "Both amounts must be numbers." });
  }
  if (maxTransactionAmount <= 0 || requireApprovalAbove <= 0) {
    return res.status(400).json({ success: false, error: "Amounts must be positive." });
  }
  if (requireApprovalAbove > maxTransactionAmount) {
    return res.status(400).json({ success: false, error: "requireApprovalAbove cannot exceed maxTransactionAmount." });
  }
  policy.maxTransactionAmount = maxTransactionAmount;
  policy.requireApprovalAbove = requireApprovalAbove;
  res.json({ success: true, policy: { ...policy } });
});

// ---- agent / approvals / webhook ----
app.post("/api/agent/prompt", async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    if (!userPrompt) return res.status(400).json({ error: "Prompt is required." });

    let lastPaymentResult = null;
    const store = { setLastPaymentResult: (r) => { lastPaymentResult = r; } };

    const execution = await requestContext.run(store, () =>
      agent.invoke({ messages: [{ role: "user", content: userPrompt }] })
    );

    // v1's createAgent returns LangGraph-style state ({ messages: [...] }).
    // Pull the last message's content defensively in case the exact shape
    // differs across versions.
    const messages = Array.isArray(execution?.messages) ? execution.messages : null;
    const lastMessage = messages ? messages[messages.length - 1] : execution;
    const agentOutput = lastMessage?.content ?? JSON.stringify(execution);

    // paymentResult is whatever shoppingAgent.pay() returned, raw and
    // unmodified — the frontend tries to find an order id in it to open
    // Razorpay Checkout automatically, and falls back to showing the raw
    // object if it can't.
    res.json({ success: true, agentOutput, paymentResult: lastPaymentResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/approvals/pending", async (req, res) => {
  try {
    const pending = await payguard.approvals.listPending();
    res.json({ success: true, pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/approvals/action", requireAdminKey, async (req, res) => {
  try {
    const { approvalId, action, reason } = req.body;

    if (action === "APPROVE") {
      // Per PayGuard's docs, approve() itself "unlocks execution" — it talks
      // to Razorpay internally. We don't create a second order here (that
      // would be untracked by PayGuard and break reconciliation); instead we
      // hand back whatever approve() returns and let the frontend look for
      // an order id in it.
      const updated = await payguard.approvals.approve(approvalId, reason);
      return res.json({ success: true, status: "APPROVED", data: updated });
    }

    const updated = await payguard.approvals.reject(approvalId, reason);
    res.json({ success: true, status: "BLOCKED", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---- manual test-mode checkout ----
app.post("/api/payment/order", async (req, res) => {
  try {
    const { amount, itemId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: "Positive amount required." });
    if (amount > policy.maxTransactionAmount) {
      return res.status(403).json({ success: false, error: `Amount exceeds max limit of ₹${policy.maxTransactionAmount}.` });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { itemId: itemId || "manual" },
    });
    res.json({ success: true, order, requiresApproval: amount > policy.requireApprovalAbove });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = await import("node:crypto");
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const isValid = expected === razorpay_signature;
    res.json({ success: isValid, status: isValid ? "VERIFIED" : "SIGNATURE_MISMATCH" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/webhooks/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const result = await webhookHandler.handleWebhook({
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
      rawBody: req.body,
      signature,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PayGuard demo server on http://localhost:${PORT}`));