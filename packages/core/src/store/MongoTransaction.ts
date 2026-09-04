import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  orderId: String,
  approvalId: String,
  agentId: { type: String, required: true },
  amount: { type: Number, required: true },
  // ADD "UNKNOWN" AND "RECONCILED" TO THIS ENUM LIST
  status: { 
    type: String, 
    enum: [
      "PENDING", 
      "EXECUTING", 
      "SUCCESS", 
      "FAILED", 
      "BLOCKED", 
      "WAITING_FOR_APPROVAL", 
      "UNKNOWN", 
      "RECONCILED"
    ], 
    required: true 
  },
  decision: { type: String, enum: ["ALLOW", "REQUIRE_APPROVAL", "BLOCK"], required: true },
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

export const MongoTransaction = mongoose.models.PayGuardTransaction || mongoose.model("PayGuardTransaction", transactionSchema);