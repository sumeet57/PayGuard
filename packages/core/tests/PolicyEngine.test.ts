import { describe, expect, it } from "vitest";
import { PolicyEngine } from "../src/PolicyEngine";
import type { PaymentRequest } from "../src/types";

function req(amount: number): PaymentRequest {
  return { amount, currency: "INR", merchant: { id: "m-1" }, idempotencyKey: "k" };
}

describe("PolicyEngine.evaluate", () => {
  it("passes when there is no policy configured at all", () => {
    const engine = new PolicyEngine();
    expect(engine.evaluate(undefined, req(1_000_000))).toBe("PASS");
  });

  it("blocks when the amount exceeds the agent-level maxTransactionAmount", () => {
    const engine = new PolicyEngine();
    expect(engine.evaluate({ maxTransactionAmount: 100 }, req(101))).toBe("BLOCK");
  });

  it("passes at exactly the maxTransactionAmount boundary (not strictly greater than)", () => {
    const engine = new PolicyEngine();
    expect(engine.evaluate({ maxTransactionAmount: 100 }, req(100))).toBe("PASS");
  });

  it("requires approval when amount exceeds requireApprovalAbove but stays within maxTransactionAmount", () => {
    const engine = new PolicyEngine();
    expect(
      engine.evaluate({ maxTransactionAmount: 1000, requireApprovalAbove: 500 }, req(600))
    ).toBe("REQUIRE_APPROVAL");
  });

  it("prefers the agent-level policy over the global policy when both are set", () => {
    const engine = new PolicyEngine({ maxTransactionAmount: 100 });
    expect(engine.evaluate({ maxTransactionAmount: 1000 }, req(500))).toBe("PASS");
  });

  it("falls back to the global policy for a field the agent policy omits", () => {
    const engine = new PolicyEngine({ maxTransactionAmount: 100 });
    expect(engine.evaluate({}, req(500))).toBe("BLOCK");
  });

  it("falls back to the global policy entirely when no agent policy is passed", () => {
    const engine = new PolicyEngine({ requireApprovalAbove: 50 });
    expect(engine.evaluate(undefined, req(100))).toBe("REQUIRE_APPROVAL");
  });

  it("returns BLOCK rather than REQUIRE_APPROVAL when both thresholds are exceeded", () => {
    const engine = new PolicyEngine();
    expect(
      engine.evaluate({ maxTransactionAmount: 100, requireApprovalAbove: 50 }, req(150))
    ).toBe("BLOCK");
  });

  it("treats unset thresholds as unlimited (Infinity)", () => {
    const engine = new PolicyEngine();
    expect(engine.evaluate({}, req(Number.MAX_SAFE_INTEGER))).toBe("PASS");
  });
});
