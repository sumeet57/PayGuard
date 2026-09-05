# PayGuard Documentation

> **Agentic Payment Security & Orchestration Runtime for Razorpay**

PayGuard is an open-source security runtime layer that enables autonomous AI agents to execute transactions on Razorpay safely. It enforces agent identity, deterministic spending policies, behavioral anomaly analysis, human-in-the-loop approvals, idempotency locks, and automated background reconciliation.

## 📂 Repository Monorepo Structure

```text
packages/
├── core/       # PayGuard SDK (@payguard/core) - Published npm package containing policies, idempotency, & gateway connectors.
├── example/    # Interactive Demo Application (Live Playground). Contains both frontend & backend demo code.
└── server/     # Production Platform Infrastructure deployed on Google Cloud Run.
                ├── Backend: Managed LLM proxy service for Mode 3 (PayGuard Intelligence), user auth, & API key management.
                └── Frontend: Official documentation portal & Developer Dashboard for managing API keys.

```
---

## 💡 Core Philosophy

> **AI investigates; deterministic controls enforce.**

Never grant an LLM direct or unmonitored authority over financial infrastructure. An LLM acts as an investigator to analyze contextual risk, while PayGuard Core enforces execution rules deterministically before any payment request reaches Razorpay.

```text
AI Agent ──► Payment Intent ──► PayGuard Core ──► Policy Check ──► AI Investigation ──► Razorpay Gateway

```

---

## ⚡ Key Features

* **3 Decision Modes:** Categorizes payment intents into `ALLOW`, `REQUIRE_APPROVAL`, or `BLOCK`.
* **3 AI Operating Modes:** Flexible architecture supporting `No AI`, `Developer-Owned AI`, or `PayGuard Intelligence`.
* **Deterministic Policy Engine:** Enforces hard transaction limits, approval thresholds, and rate rules without depending on LLM execution.
* **Behavioral Anomaly Detection:** Flags price spikes, unusual purchasing velocity, or suspicious agent behavior.
* **Human-in-the-Loop (HITL):** Built-in queue management to pause high-risk payment intents for admin review.
* **Idempotency & Concurrent Locking:** Eliminates race conditions and duplicate charges on agent retries.
* **Webhook & Reconciliation Sync:** Signature-verified webhook processing and background workers to resolve `UNKNOWN` or timed-out orders safely.

---

## 🚀 Live Demo & Playground

Try out PayGuard interactively in the official web sandbox:

🌐 **Live Playground:** [payguardplayground.sumeet.app](https://www.google.com/search?q=https://payguardplayground.sumeet.app)

---

## 🛠️ The 3 AI Operating Modes

PayGuard abstracts intelligence checks so developers can configure risk analysis levels based on their environment:

```text
                         PayGuard Core
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
  Mode 1: No AI           Mode 2: BYO LLM         Mode 3: Managed AI
(Deterministic)        (Custom Keys/Models)    (PayGuard Remote Proxy)
  [ACTIVE]            [PLANNED / ROADMAP]             [ACTIVE]

```

1. **Mode 1 — No AI (Deterministic Only):** Omit the `ai` configuration property entirely. PayGuard runs purely on deterministic policy rules (limits, thresholds, caps). Ideal for low-latency, offline, or strict rule-based environments.
2. **Mode 2 — Developer-Owned AI (BYO-AI):** *[Roadmap]* Direct key integration for custom OpenAI, Gemini, or Anthropic models.
3. **Mode 3 — PayGuard Intelligence:** Pass `PayGuardAIProvider` to utilize PayGuard’s managed remote server for automated contextual risk analysis.

---

## 📊 Decision & State Lifecycle

| Decision | Trigger Condition | System Action | Final State |
| --- | --- | --- | --- |
| **`ALLOW`** | Passes deterministic rules and AI risk evaluation. | Generates Razorpay Order ID instantly. | `EXECUTING` |
| **`REQUIRE_APPROVAL`** | Exceeds soft threshold or AI flags suspicious patterns. | Holds execution; pushes item to human queue. | `WAITING_FOR_APPROVAL` |
| **`BLOCK`** | Violates hard spending caps or AI detects an anomaly. | Halts transaction immediately before gateway. | `BLOCKED` |

---

## 📦 API Reference & Configuration

### 1. Installation

```bash
npm install payguard

```

---

### 2. Constructor: `new PayGuard(options)`

Initializes the core security runtime instance.

```typescript
import { PayGuard, PayGuardAIProvider } from "payguard";

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  storage: {
    database: "mongodb", // Currently supported: "mongodb" (SQL adapters in development)
    connectionString: process.env.MONGO_URI!,
    collectionName: "payguard_transactions", // Optional (Default: "payguard_transactions")
  },
  policy: {
    maxTransactionAmount: 30000,   // Hard block for transactions > ₹30,000
    requireApprovalAbove: 10000,   // Flag for human review for transactions > ₹10,000
  },
  // Optional: Omit this field to run Mode 1 (No AI)
  ai: new PayGuardAIProvider({
    apiKey: process.env.PAYGUARD_API_KEY!,
  }),
});

```

#### Options Parameters

* **`razorpay`** *(Required)*: Object containing `keyId` and `keySecret` for standard Razorpay authentication.
* **`storage`** *(Required)*: Database adapter config.
* `database`: Storage type. Currently, **`"mongodb"`** is the active supported provider. SQL drivers are planned for future releases.
* `connectionString`: Valid MongoDB connection URI.
* `collectionName`: *(Optional)* Document collection name in MongoDB (Defaults to `"payguard_transactions"`).


* **`policy`** *(Required)*: Deterministic limit parameters.
* `maxTransactionAmount`: Numeric limit in INR. Any amount exceeding this value triggers an immediate `BLOCK` decision.
* `requireApprovalAbove`: Numeric soft threshold in INR. Any amount above this value triggers a `REQUIRE_APPROVAL` decision.


* **`ai`** *(Optional)*: Instance of `PayGuardAIProvider`. If omitted, PayGuard defaults to Mode 1 (Deterministic Rules Only).

---

### 3. Agent Registration: `payguard.agent(config)`

Registers a unique agent identity bound to execution capabilities.

```typescript
const shoppingAgent = await payguard.agent({
  id: "shopping-agent-01",
  name: "Autonomous E-Commerce Agent",
  capabilities: ["e-commerce", "procurement", "payments"],
});

```

#### Parameters

* **`id`**: Unique string identifier for tracking agent activity across transactions.
* **`name`**: Human-readable display label.
* **`capabilities`**: Array of action scope tags for audit tracking.

---

### 4. Initiating Payment: `agent.pay(params)`

Evaluates a payment intent through PayGuard's security gates.

```typescript
const result = await shoppingAgent.pay({
  amount: 8500,
  currency: "INR",
  merchant: { id: "merchant_electronics_01" },
  reason: "Procurement of development hardware (Catalog baseline: ₹8500 INR)",
  idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
});

console.log(result);

```

#### Parameters

* **`amount`**: Numeric value in base currency units (INR).
* **`currency`**: Standard 3-letter currency code (e.g., `"INR"`).
* **`merchant`**: Object containing `id` or merchant name metadata.
* **`reason`**: Descriptive intent context passed to the risk engine. Include item descriptions and price context to avoid false-positive risk blocks.
* **`idempotencyKey`**: Unique string preventing duplicate executions for the same intent.

---

### 5. Human Approval Workflow: `payguard.approvals`

Handles manual management for transactions flagged with `REQUIRE_APPROVAL`.

```typescript
// 1. Fetch pending approvals queue
const pendingList = await payguard.approvals.listPending();

// 2. Approve transaction -> Unlocks execution & generates Razorpay Order
const approvedTxn = await payguard.approvals.approve(
  "apr_1788564406531", 
  "Approved by finance manager"
);

// 3. Reject transaction -> Transitions status to BLOCKED/REJECTED
const rejectedTxn = await payguard.approvals.reject(
  "apr_1788564406531", 
  "Unusual request time"
);

```

---

### 6. Webhook Processing: `RazorpayWebhookHandler`

Verifies and processes incoming Razorpay event signatures to synchronize state automatically.

```typescript
import express from "express";
import { RazorpayWebhookHandler } from "payguard";

const app = express();
const webhookHandler = new RazorpayWebhookHandler(payguard);

// NOTE: Use express.raw to preserve exact raw body buffer for HMAC verification
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

### 7. Background Reconciliation: `ReconciliationWorker`

Background service that polls for stuck, abandoned, or `UNKNOWN` orders and updates their states against Razorpay's source of truth.

```typescript
import { ReconciliationWorker } from "payguard";

const worker = new ReconciliationWorker(payguard);

// Run background worker every 15 minutes
setInterval(async () => {
  const summary = await worker.runReconciliation(15); // Expiry threshold in minutes
  console.log(`Reconciled ${summary.reconciledCount} pending transactions.`);
}, 15 * 60 * 1000);

```

---

## 📄 License

MIT © PayGuard