import { PolicyConfig, PaymentRequest } from "./types";

export class PolicyEngine {
  private globalPolicy: PolicyConfig;

  constructor(policy?: PolicyConfig) {
    this.globalPolicy = policy || {};
  }

  public evaluate(agentPolicy: PolicyConfig | undefined, request: PaymentRequest): "PASS" | "BLOCK" | "REQUIRE_APPROVAL" {
    const maxAmount = agentPolicy?.maxTransactionAmount || this.globalPolicy.maxTransactionAmount || Infinity;
    const approvalThreshold = agentPolicy?.requireApprovalAbove || this.globalPolicy.requireApprovalAbove || Infinity;

    if (request.amount > maxAmount) {
      return "BLOCK";
    }

    if (request.amount > approvalThreshold) {
      return "REQUIRE_APPROVAL";
    }

    return "PASS";
  }
}