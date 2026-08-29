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

    if (policyDecision === "BLOCK") {
      return {
        decision: "BLOCK",
        transactionId,
        status: "BLOCKED",
        reason: "Transaction exceeded deterministic policy limits."
      };
    }

    if (policyDecision === "REQUIRE_APPROVAL") {
      const approvalId = `apr_${Date.now()}`;
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
        return {
          decision: "BLOCK",
          transactionId,
          status: "BLOCKED",
          reason: "AI investigation flagged transaction as severe behavioral anomaly."
        };
      }

      if (aiResult.recommendation === "REQUIRE_APPROVAL") {
        const approvalId = `apr_${Date.now()}`;
        return {
          decision: "REQUIRE_APPROVAL",
          transactionId,
          approvalId,
          status: "WAITING_FOR_APPROVAL",
          reason: "AI investigation flagged ambiguous behavior requiring human review."
        };
      }
    }

    return {
      decision: "ALLOW",
      transactionId,
      status: "EXECUTING"
    };
  }
}