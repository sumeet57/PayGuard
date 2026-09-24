import dotenv from "dotenv";
import { PayGuard, GeminiProvider, ReconciliationWorker } from "payguard";

dotenv.config();

const payguard = new PayGuard({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  storage: {
    database: "mongodb",
    connectionString: process.env.MONGO_URI,
    collectionName: "payguard_transactions",
  },
  policy: {
    maxTransactionAmount: 30000,
    requireApprovalAbove: 10000,
  },
  ai: new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-1.5",
  }),
});

const agent = await payguard.agent({
  id: "demo-shopping-agent",
  name: "Autonomous Shopping Agent",
  capabilities: ["e-commerce", "payments"],
});

const purchases = [
  { item: "Standard Office Mouse", amount: 300 },
  { item: "Developer Monitor 27-inch", amount: 10500 },
  { item: "Enterprise Server Rack", amount: 40000 },
];

// Runs one hardcoded purchase through the agent and prints the decision
async function buy(purchase) {
  const result = await agent.pay({
    amount: purchase.amount,
    currency: "INR",
    merchant: { id: "merchant_buildathon_01" },
    reason: `Purchase of ${purchase.item}`,
    idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  });

  console.log(`${purchase.item} (Rs ${purchase.amount}) -> ${result.decision} / ${result.status} / ${result.reason}`);
  return result;
}

// Approves the first pending approval and rejects the rest
async function reviewApprovals() {
  const pending = await payguard.approvals.listPending();
  console.log(`Pending approvals: ${pending.length}`);

  for (const [index, approval] of pending.entries()) {
    const id = approval.approvalId ?? approval.id;

    if (index === 0) {
      const approved = await payguard.approvals.approve(id, "Approved by demo reviewer");
      console.log(`Approved ${id}`, approved);
    } else {
      await payguard.approvals.reject(id, "Rejected by demo reviewer");
      console.log(`Rejected ${id}`);
    }
  }
}

// Checks for stale transactions and reconciles them against Razorpay
async function reconcile() {
  const worker = new ReconciliationWorker(payguard);
  const summary = await worker.runReconciliation(15);
  console.log(`Reconciled ${summary.reconciledCount} transactions.`);
}

// Runs the whole demo in order
async function main() {
  for (const purchase of purchases) {
    await buy(purchase);
  }
  await reviewApprovals();
  await reconcile();
}

try {
  await main();
} catch (err) {
  console.error("Demo failed:", err.message);
  process.exitCode = 1;
}

process.exit();