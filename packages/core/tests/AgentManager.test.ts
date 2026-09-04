import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildPayGuard, createMockAIProvider, createMockStorage } from "./helpers";
import type { PaymentRequest } from "../src/types";
import Razorpay from "razorpay";

vi.mock("razorpay", () => {
  const MockRazorpay = vi.fn().mockImplementation(function (this: any) {
    this.orders = {
      create: vi.fn().mockResolvedValue({ id: "order_mock_123", status: "created" })
    };
  });
  return { default: MockRazorpay };
});

function req(overrides: Partial<PaymentRequest> = {}): PaymentRequest {
  return {
    amount: 100,
    currency: "INR",
    merchant: { id: "m-1" },
    idempotencyKey: "idem-1",
    ...overrides,
  };
}

describe("AgentManager.pay — Razorpay & Gateway Failure Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Razorpay orders.create with correct options and returns EXECUTING on success", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 500, currency: "INR" }));

    expect(result.decision).toBe("ALLOW");
    expect(result.status).toBe("EXECUTING");

    expect(storage.saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order_mock_123",
        status: "EXECUTING",
        decision: "ALLOW"
      })
    );
  });

  it(
    "handles GATEWAY_TIMEOUT and marks transaction as UNKNOWN state",
    async () => {
      vi.useFakeTimers();

      (Razorpay as any).mockImplementationOnce(function (this: any) {
        this.orders = {
          create: vi.fn().mockImplementation(() => new Promise(() => {}))
        };
      });

      const storage = createMockStorage();
      const payguard = buildPayGuard({}, storage);
      const agent = payguard.agent({
        id: "agent-1",
        name: "A",
        capabilities: [],
        policy: { maxTransactionAmount: 5000 },
      });

      const payPromise = agent.pay(req({ amount: 500 }));

      // Advance fake timers asynchronously so microtasks resolve smoothly
      await vi.advanceTimersByTimeAsync(5001);

      const result = await payPromise;

      expect(result.decision).toBe("ALLOW");
      expect(result.status).toBe("UNKNOWN");

      expect(storage.saveTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "UNKNOWN",
          reason: "Razorpay request timed out after 5000ms. Held for reconciliation."
        })
      );

      vi.useRealTimers();
    },
    10000 // Extended test timeout to prevent Vitest runner timeout
  );

  it("handles unexpected Razorpay SDK errors gracefully and marks status as UNKNOWN", async () => {
    (Razorpay as any).mockImplementationOnce(function (this: any) {
      this.orders = {
        create: vi.fn().mockRejectedValue(new Error("API Connection Failed"))
      };
    });

    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "A",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 },
    });

    const result = await agent.pay(req({ amount: 500 }));

    expect(result.decision).toBe("ALLOW");
    expect(result.status).toBe("UNKNOWN");

    expect(storage.saveTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "UNKNOWN",
        reason: "Execution failed: API Connection Failed"
      })
    );
  });
});