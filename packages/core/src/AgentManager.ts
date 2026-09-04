import { PayGuard } from "./PayGuard";
import { AgentConfig, PaymentRequest, PaymentResult, InvestigationContext } from "./types";
import Razorpay from "razorpay";

export class AgentManager {
  private payguard: PayGuard;
  private config: AgentConfig;

  constructor(payguard: PayGuard, config: AgentConfig) {
    this.payguard = payguard;
    this.config = config;
  }

  public async pay(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `pg_txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 0. IDEMPOTENCY LOCK
    const lockAcquired = this.payguard.lockStore.lock(request.idempotencyKey);
    if (!lockAcquired) {
      return {
        decision: "BLOCK",
        transactionId,
        status: "BLOCKED",
        reason: "Duplicate or concurrent transaction in progress for this Idempotency Key."
      };
    }

    try {
      const policyDecision = this.payguard.policyEngine.evaluate(this.config.policy, request);
      const storage = this.payguard.storageConfig;
      if (storage) {
        await storage.connect();
      }

      // 1. DETERMINISTIC POLICY: BLOCK
      if (policyDecision === "BLOCK") {
        if (storage) {
          await storage.saveTransaction({
            transactionId,
            agentId: this.config.id,
            amount: request.amount,
            status: "BLOCKED",
            decision: "BLOCK",
            reason: "Transaction exceeded deterministic policy limits."
          });
        }

        return {
          decision: "BLOCK",
          transactionId,
          status: "BLOCKED",
          reason: "Transaction exceeded deterministic policy limits."
        };
      }

      // 2. DETERMINISTIC POLICY: REQUIRE_APPROVAL
      if (policyDecision === "REQUIRE_APPROVAL") {
        const approvalId = `apr_${Date.now()}`;
        if (storage) {
          await storage.saveTransaction({
            transactionId,
            approvalId,
            agentId: this.config.id,
            amount: request.amount,
            status: "WAITING_FOR_APPROVAL",
            decision: "REQUIRE_APPROVAL",
            reason: "Transaction exceeds autonomous spending threshold."
          });
        }
        return {
          decision: "REQUIRE_APPROVAL",
          transactionId,
          approvalId,
          status: "WAITING_FOR_APPROVAL",
          reason: "Transaction exceeds autonomous spending threshold."
        };
      }

      // 3. AI INVESTIGATION
      if (this.payguard.aiProvider) {
        const recentTx = storage ? await storage.getRecentTransactions(this.config.id, 5) : [];

        const context: InvestigationContext = {
          agentId: this.config.id,
          amount: request.amount,
          merchant: request.merchant,
          reason: request.reason,
          recentTransactions: recentTx
        };

        const aiResult = await this.payguard.aiProvider.investigate(context);

        if (aiResult.recommendation === "BLOCK") {
          if (storage) {
            await storage.saveTransaction({
              transactionId,
              agentId: this.config.id,
              amount: request.amount,
              status: "BLOCKED",
              decision: "BLOCK",
              reason: "AI investigation flagged transaction as severe behavioral anomaly."
            });
          }
          return {
            decision: "BLOCK",
            transactionId,
            status: "BLOCKED",
            reason: "AI investigation flagged transaction as severe behavioral anomaly."
          };
        }

        if (aiResult.recommendation === "REQUIRE_APPROVAL") {
          const approvalId = `apr_${Date.now()}`;
          if (storage) {
            await storage.saveTransaction({
              transactionId,
              approvalId,
              agentId: this.config.id,
              amount: request.amount,
              status: "WAITING_FOR_APPROVAL",
              decision: "REQUIRE_APPROVAL",
              reason: "AI investigation flagged ambiguous behavior requiring human review."
            });
          }
          return {
            decision: "REQUIRE_APPROVAL",
            transactionId,
            approvalId,
            status: "WAITING_FOR_APPROVAL",
            reason: "AI investigation flagged ambiguous behavior requiring human review."
          };
        }
      }

      // 4. GATEWAY EXECUTION
      try {
        const razorpay = new Razorpay({
          key_id: this.payguard.config.razorpay.keyId,
          key_secret: this.payguard.config.razorpay.keySecret,
        });

        const options = {
          amount: Math.round(request.amount * 100), // Convert INR rupees to paise
          currency: request.currency || "INR",
          receipt: transactionId,
          notes: {
            transactionId: transactionId,
            agentId: this.config.id,
          },
        };

        const paymentPromise = razorpay.orders.create(options);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), 5000)
        );

        const order: any = await Promise.race([paymentPromise, timeoutPromise]);

        if (storage) {
          await storage.saveTransaction({
            transactionId,
            orderId: order.id,
            agentId: this.config.id,
            amount: request.amount,
            status: "EXECUTING",
            decision: "ALLOW"
          });
        }

        return {
          decision: "ALLOW",
          transactionId,
          orderId: order.id,
          status: "EXECUTING"
        };

      } catch (error: any) {
        if (storage) {
          await storage.saveTransaction({
            transactionId,
            agentId: this.config.id,
            amount: request.amount,
            status: "UNKNOWN",
            decision: "ALLOW",
            reason: error.message === "GATEWAY_TIMEOUT"
              ? "Razorpay request timed out after 5000ms. Held for reconciliation."
              : `Execution failed: ${error.message}`
          });
        }

        return {
          decision: "ALLOW",
          transactionId,
          status: "UNKNOWN",
          reason: error.message === "GATEWAY_TIMEOUT"
            ? "Razorpay request timed out after 5000ms. Held for reconciliation."
            : `Execution failed: ${error.message}`
        };
      }
    } finally {
      this.payguard.lockStore.unlock(request.idempotencyKey);
    }
  }
}