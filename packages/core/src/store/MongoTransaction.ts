import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  approvalId: { type: String },
  agentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "BLOCKED", "WAITING_FOR_APPROVAL"] },
  decision: { type: String, enum: ["ALLOW", "REQUIRE_APPROVAL", "BLOCK"] },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const MongoTransaction = mongoose.models.PayGuardTransaction || mongoose.model("PayGuardTransaction", transactionSchema);