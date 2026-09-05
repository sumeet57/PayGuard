
# PayGuard

> **Agentic Payment Security & Orchestration Runtime for Razorpay**
> 

PayGuard is a security runtime layer that allows autonomous AI agents to interact with Razorpay safely. It enforces agent identity, deterministic financial policies, behavioral anomaly checks, human-in-the-loop approvals, idempotency locks, and automated webhook reconciliation.

---

## 💡 Core Philosophy

> **AI investigates; deterministic controls enforce.**
> 

Never give an LLM direct, unrestricted authority over financial infrastructure. The LLM acts as an investigator to analyze contextual risk, while PayGuard Core strictly enforces payment execution.

```
AI Agent ──► Payment Intent ──► PayGuard Core ──► Policy Check ──► AI Investigation ──► Razorpay
```
## ⚡ Key Features

* **3 Decision Modes:** Categorizes payments into `ALLOW`, `REQUIRE_APPROVAL`, or `BLOCK`[cite: 1].
* **3 AI Operating Modes:** Flexible architecture supporting `No AI`, `Developer-Owned AI`, or `PayGuard Intelligence`[cite: 1].
* **Deterministic Policy Engine:** Enforces hard transaction limits, daily caps, and rate limits without LLM dependency[cite: 1].
* **Behavioral Anomaly Detection:** Identifies compromised agents, rapid velocity spikes, and duplicate transaction loops[cite: 1].
* **Human-in-the-Loop (HITL):** Built-in approval queues to pause high-risk actions for manual human verification[cite: 1].
* **Idempotency & Concurrent Locking:** Prevents double-charging and race conditions on retries or concurrent agent loops[cite: 1].
* **Webhook & Reconciliation Sync:** Signature-verified webhook processing and background workers to resolve `UNKNOWN` or timed-out orders safely[cite: 1].

---

## 🛠️ The 3 AI Operating Modes

PayGuard allows developers to plug in their preferred intelligence model without breaking the core runtime[cite: 1]:

```text
                          PayGuard Core
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
      Mode 1: No AI     Mode 2: BYO LLM       Mode 3: Managed AI
    (Deterministic)   (OpenAI/Gemini/etc)   (PayGuard Server)
```

1. **Mode 1 — No AI:** Runs purely on deterministic rules. Ideal for strict, low-latency, or offline environments.
2. **Mode 2 — Developer-Owned AI (BYO-AI):** Pass your own API keys (OpenAI, Gemini, Anthropic) directly into the SDK.
3. **Mode 3 — PayGuard Intelligence:** Uses PayGuard's remote proxy service to handle contextual risk analysis.

---

## 📊 Decision Lifecycle

| Decision | Condition | System Execution | Final State |
| :--- | :--- | :--- | :--- |
| **`ALLOW`** | Passes all deterministic policies & AI investigation. | Generates official Razorpay Order. | `EXECUTING` |
| **`REQUIRE_APPROVAL`** | Exceeds soft limits or AI flags suspicious velocity/behavior. | Halts gateway execution; adds to human approval queue. | `WAITING_FOR_APPROVAL` |
| **`BLOCK`** | Violates hard limits or AI detects a compromised/hijacked agent. | Immediately terminates execution before hitting Razorpay. | `BLOCKED`|

---

## 🚀 Setup & Integration Guide

### 1. Installation

```bash
npm install payguard

```

---

### 2. SDK Initialization

Initialize `PayGuard` with your Razorpay credentials, database adapter, and policy parameters.

```typescript
import { PayGuard, PayGuardAIProvider } from "payguard";

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI!,
    collectionName: "payguard_transactions",
  },
  policy: {
    maxTransactionAmount: 25000,   // Hard block for amounts > ₹25,000
    requireApprovalAbove: 10000,   // Require human review for amounts > ₹10,000
  },
  ai: new PayGuardAIProvider({
    apiKey: process.env.PAYGUARD_API_KEY!,
  }),
});

```

---

### 3. Agent Registration & Payment Execution

Register your agent's identity and initiate payment requests.

```typescript
// Register Agent Identity
const shoppingAgent = await payguard.agent({
  id: "shopping-agent-01",
  name: "Autonomous E-Commerce Agent",
  capabilities: ["e-commerce", "procurement", "payment"],
});

// Execute Secured Payment Intent
const result = await shoppingAgent.pay({
  amount: 8500,
  currency: "INR",
  merchant: { id: "merchant_electronics_01" },
  reason: "Procurement of development hardware",
  idempotencyKey: "idemp_txn_101",
});

console.log("Payment Result:", result);

```

---

### 4. Human Approval Management (HITL)

Query and process transactions flagged under `REQUIRE_APPROVAL`.

```typescript
// 1. Fetch pending approvals queue
const pendingList = await payguard.approvals.listPending();

// 2. Approve transaction -> Unlocks execution
await payguard.approvals.approve("apr_1788564406531");

// 3. Reject transaction -> Halts execution
await payguard.approvals.reject("apr_1788564406531");

```

---

### 5. Webhook Signature Verification

Process Razorpay webhook lifecycle updates safely using raw body verification.

```typescript
import express from "express";
import { RazorpayWebhookHandler } from "payguard";

const app = express();
const webhookHandler = new RazorpayWebhookHandler(payguard);

app.post(
  "/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const result = await webhookHandler.handleWebhook({
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
        rawBody: req.body,
        signature,
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

```

---

### 6. Background Reconciliation Engine

Reconcile stuck `UNKNOWN` or timed-out transactions against Razorpay's source of truth.

```typescript
import { ReconciliationWorker } from "payguard";

const worker = new ReconciliationWorker(payguard);

// Run background worker periodically
setInterval(async () => {
  const summary = await worker.runReconciliation(15); // Expiry threshold in minutes
  console.log(`Reconciled ${summary.reconciledCount} transactions.`);
}, 15 * 60 * 1000);

```

---

## 📄 License

MIT © PayGuard
