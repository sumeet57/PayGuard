import { PayGuard } from "./PayGuard";
import { AgentConfig, PaymentRequest, PaymentResult, InvestigationContext } from "./types";

export class AgentManager {
  private payguard: PayGuard;
  private config: AgentConfig;

  constructor(payguard: PayGuard, config: AgentConfig) {
    this.payguard = payguard;
    this.config = config;
  }

  public async pay(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `pg_txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const policyDecision = this.payguard.policyEngine.evaluate(this.config.policy, request);
    const storage = this.payguard.storageConfig;
    if(storage) {
      await storage.connect();
    };

    if (policyDecision === "BLOCK") {
      if(storage) {
        await storage.saveTransaction({
          transactionId,
          agentId: this.config.id,
          amount: request.amount,
          status: "BLOCKED",
          decision: "BLOCK",
          reason: "Transaction exceeded deterministic policy limits."
        })
      }

      return {
        decision: "BLOCK",
        transactionId,
        status: "BLOCKED",
        reason: "Transaction exceeded deterministic policy limits."
      };
      
    }

    if (policyDecision === "REQUIRE_APPROVAL") {
      const approvalId = `apr_${Date.now()}`;
      if(storage) {
        await storage.saveTransaction({
          transactionId,
          approvalId,
          agentId: this.config.id,
          amount: request.amount,
          status: "WAITING_FOR_APPROVAL",
          decision: "REQUIRE_APPROVAL",
          reason: "Transaction exceeds autonomous spending threshold."
        })
      }
      return {
        decision: "REQUIRE_APPROVAL",
        transactionId,
        approvalId,
        status: "WAITING_FOR_APPROVAL",
        reason: "Transaction exceeds autonomous spending threshold."
      };
    }

    if (this.payguard.aiProvider) {
      const context: InvestigationContext = {
        agentId: this.config.id,
        amount: request.amount,
        merchant: request.merchant,
        reason: request.reason,
        recentTransactions: [] 
      };

      const aiResult = await this.payguard.aiProvider.investigate(context);

      if (aiResult.recommendation === "BLOCK") {
        if(storage) {
          await storage.saveTransaction({
            transactionId,
            agentId: this.config.id,
            amount: request.amount,
            status: "BLOCKED",
            decision: "BLOCK",
            reason: "AI investigation flagged transaction as severe behavioral anomaly."
          })
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
        if(storage) {
          await storage.saveTransaction({
            transactionId,
            approvalId,
            agentId: this.config.id,
            amount: request.amount,
            status: "WAITING_FOR_APPROVAL",
            decision: "REQUIRE_APPROVAL",
            reason: "AI investigation flagged ambiguous behavior requiring human review."
          })
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

    if(storage) {
      await storage.saveTransaction({
        transactionId,
        agentId: this.config.id,
        amount: request.amount,
        status: "EXECUTING",
        decision: "ALLOW"
      })
    }

    return {
      decision: "ALLOW",
      transactionId,
      status: "EXECUTING"
    };
  }
}