import { describe, expect, it } from "vitest";
import { buildPayGuard, createMockAIProvider, createMockStorage } from "./helpers";
import type { PaymentRequest } from "../src/types";

function req(overrides: Partial<PaymentRequest> = {}): PaymentRequest {
  return {
    amount: 100,
    currency: "INR",
    merchant: { id: "m-1" },
    idempotencyKey: "idem-1",
    ...overrides,
  };
}

describe("AgentManager.pay — deterministic policy", () => {
  it("blocks a transaction that exceeds the agent's maxTransactionAmount", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "Shopping Agent",
      capabilities: ["shopping"],
      policy: { maxTransactionAmount: 1000 },
    });

    const result = await agent.pay(req({ amount: 1500 }));

    expect(result.decision).toBe("BLOCK");
    expect(result.status).toBe("BLOCKED");
    expect(storage.connect).toHaveBeenCalledTimes(1);
    expect(storage.saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "BLOCK",
        status: "BLOCKED",
        agentId: "agent-1",
        amount: 1500,
      })
    );
  });

  it("allows a transaction exactly at the maxTransactionAmount boundary", async () => {
    const payguard = buildPayGuard();
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 1000 },
    });

    const result = await agent.pay(req({ amount: 1000 }));
    expect(result.decision).toBe("ALLOW");
  });

  it("requires approval when amount exceeds requireApprovalAbove but stays under maxTransactionAmount", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000, requireApprovalAbove: 1000 },
    });

    const result = await agent.pay(req({ amount: 2000 }));

    expect(result.decision).toBe("REQUIRE_APPROVAL");
    if (result.decision === "REQUIRE_APPROVAL") {
      expect(result.approvalId).toMatch(/^apr_\d+$/);
    }
    expect(storage.saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "WAITING_FOR_APPROVAL", decision: "REQUIRE_APPROVAL" })
    );
  });

  it("falls back to PayGuard's global policy when the agent has no policy of its own", async () => {
    const payguard = buildPayGuard({ policy: { maxTransactionAmount: 500 } });
    const agent = payguard.agent({ id: "agent-2", name: "A", capabilities: [] });

    const result = await agent.pay(req({ amount: 600 }));
    expect(result.decision).toBe("BLOCK");
  });

  it("allows a transaction below all thresholds and persists it as EXECUTING", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 100 }));

    expect(result.decision).toBe("ALLOW");
    expect(result.status).toBe("EXECUTING");
    expect(result.transactionId).toMatch(/^pg_txn_\d+_[a-z0-9]+$/);
    expect(storage.saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ decision: "ALLOW", status: "EXECUTING" })
    );
  });

  it("generates a unique transactionId on every call", async () => {
    const payguard = buildPayGuard();
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const [r1, r2] = await Promise.all([
      agent.pay(req({ amount: 10, idempotencyKey: "k1" })),
      agent.pay(req({ amount: 20, idempotencyKey: "k2" })),
    ]);

    expect(r1.transactionId).not.toBe(r2.transactionId);
  });

  it("does not throw when no storage adapter is configured", async () => {
    const payguard = buildPayGuard();
    // Simulate a PayGuard instance without a usable storage adapter.
    // @ts-expect-error intentionally simulating an unset storage adapter
    payguard.storageConfig = undefined;
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 100 }));
    expect(result.decision).toBe("ALLOW");
  });
});

describe("AgentManager.pay — AI investigation", () => {
  it("only consults the AI provider once deterministic policy checks pass", async () => {
    const ai = createMockAIProvider("ALLOW");
    const payguard = buildPayGuard({ ai });
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    await agent.pay(req({ amount: 100, merchant: { id: "m-9" }, reason: "restock" }));

    expect(ai.investigate).toHaveBeenCalledTimes(1);
    expect(ai.investigate).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: "agent-1",
        amount: 100,
        merchant: { id: "m-9" },
        reason: "restock",
      })
    );
  });

  it("does not consult the AI provider when the deterministic policy already blocks", async () => {
    const ai = createMockAIProvider("ALLOW");
    const payguard = buildPayGuard({ ai });
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 100 },
    });

    await agent.pay(req({ amount: 1000 }));
    expect(ai.investigate).not.toHaveBeenCalled();
  });

  it("blocks when the AI provider flags a severe anomaly", async () => {
    const ai = createMockAIProvider("BLOCK");
    const payguard = buildPayGuard({ ai });
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 100 }));
    expect(result.decision).toBe("BLOCK");
    expect(result.status).toBe("BLOCKED");
  });

  it("requires approval when the AI provider flags ambiguous behavior", async () => {
    const ai = createMockAIProvider("REQUIRE_APPROVAL");
    const payguard = buildPayGuard({ ai });
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 100 }));
    expect(result.decision).toBe("REQUIRE_APPROVAL");
  });

  it("allows the transaction through when the AI provider recommends ALLOW", async () => {
    const ai = createMockAIProvider("ALLOW");
    const payguard = buildPayGuard({ ai });
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 100 }));
    expect(result.decision).toBe("ALLOW");
    expect(result.status).toBe("EXECUTING");
  });
});
