import { describe, expect, it, vi, beforeEach } from "vitest";
import { PayGuardAIProvider, OpenAIProvider } from "../src/AiManager";
import { buildPayGuard, createMockStorage } from "./helpers";
import type { InvestigationContext } from "../src/types";
import axios from "axios";

vi.mock("axios");

const mockContext: InvestigationContext = {
  agentId: "agent-test-1",
  amount: 500,
  merchant: { id: "merchant-123" },
  reason: "Bulk inventory purchase",
  recentTransactions: []
};

describe("PayGuardAIProvider (Managed Proxy)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

//   it("sends investigation payload to proxy endpoint and returns recommendation", async () => {
//     (axios.post as any).mockResolvedValueOnce({
//       data: {
//         anomalous: false,
//         confidence: 0.98,
//         recommendation: "ALLOW"
//       }
//     });

//     const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
//     const result = await provider.investigate(mockContext);

//     expect(axios.post).toHaveBeenCalledWith(
//       "https://api.payguard.dev/v1/investigate",
//       mockContext,
//       expect.objectContaining({
//         headers: { "x-payguard-key": "pg_live_mock_123" }
//       })
//     );
//     expect(result.recommendation).toBe("ALLOW");
//     expect(result.confidence).toBe(0.98);
//   });

  it("gracefully falls back to REQUIRE_APPROVAL when the proxy server fails or times out", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("Network Timeout"));

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.confidence).toBe(0);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });
});

describe("OpenAIProvider (BYO Key)", () => {
  it("evaluates context and returns structured result", async () => {
    const provider = new OpenAIProvider({ apiKey: "sk-mock-key", model: "gpt-4o" });
    const result = await provider.investigate(mockContext);

    expect(result.recommendation).toBe("ALLOW");
    expect(result.anomalous).toBe(false);
  });
});

describe("AgentManager integration with AI Providers", () => {
  it("triggers PayGuardAIProvider during agent payment flow", async () => {
    const mockProxyResult = { anomalous: true, confidence: 0.9, recommendation: "BLOCK" as const };
    
    const mockAiProvider = {
      investigate: vi.fn().mockResolvedValue(mockProxyResult)
    };

    const storage = createMockStorage();
    const payguard = buildPayGuard({ ai: mockAiProvider }, storage);
    const agent = payguard.agent({
      id: "agent-1",
      name: "Shopping Agent",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 }
    });

    const result = await agent.pay({
      amount: 1000,
      currency: "INR",
      merchant: { id: "m-1" },
      idempotencyKey: "idem-ai-1"
    });

    expect(mockAiProvider.investigate).toHaveBeenCalledTimes(1);
    expect(result.decision).toBe("BLOCK");
    expect(result.status).toBe("BLOCKED");
  });

  it("bypasses AI investigation entirely when no ai provider is configured", async () => {
    const payguard = buildPayGuard({ ai: undefined });
    const agent = payguard.agent({
      id: "agent-1",
      name: "Shopping Agent",
      capabilities: [],
      policy: { maxTransactionAmount: 5000 }
    });

    const result = await agent.pay({
      amount: 1000,
      currency: "INR",
      merchant: { id: "m-1" },
      idempotencyKey: "idem-no-ai-1"
    });

    expect(result.decision).toBe("ALLOW");
  });
});