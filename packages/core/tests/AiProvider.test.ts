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

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PayGuardAIProvider (Managed Proxy)", () => {
  it("sends investigation payload to proxy endpoint and returns recommendation", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: {
        response: JSON.stringify({
          anomalous: false,
          confidence: 0.98,
          recommendation: "ALLOW",
          reason: "Amount and merchant match normal behaviour."
        })
      }
    });

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(axios.post).toHaveBeenCalledWith(
      "https://payguard-server-460009295734.asia-south1.run.app/api/ai/request",
      { prompt: expect.stringContaining("agent-test-1") },
      { headers: { "x-api-key": "pg_live_mock_123" }, timeout: 30000 }
    );
    expect(result.anomalous).toBe(false);
    expect(result.recommendation).toBe("ALLOW");
    expect(result.confidence).toBe(0.98);
    expect(result.reason).toBe("Amount and merchant match normal behaviour.");
  });

  it("uses a custom endpoint and strips the trailing slash", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: { response: JSON.stringify({ anomalous: false, confidence: 1, recommendation: "ALLOW", reason: "ok" }) }
    });

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123", endpoint: "https://proxy.example.com/" });
    await provider.investigate(mockContext);

    expect((axios.post as any).mock.calls[0][0]).toBe("https://proxy.example.com/api/ai/request");
  });

  it("parses JSON even when the model wraps it in backticks or extra text", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: {
        response: 'Here you go:\n```json\n{"anomalous": true, "confidence": 0.8, "recommendation": "BLOCK", "reason": "Suspicious"}\n```'
      }
    });

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.recommendation).toBe("BLOCK");
    expect(result.confidence).toBe(0.8);
  });

  it("escalates to REQUIRE_APPROVAL when the model flags anomalous but says ALLOW", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: {
        response: JSON.stringify({ anomalous: true, confidence: 0.7, recommendation: "ALLOW", reason: "Odd pattern" })
      }
    });

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });

  it("gracefully falls back to REQUIRE_APPROVAL when the proxy server fails or times out", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("Network Timeout"));

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.confidence).toBe(0);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });

  it("falls back to REQUIRE_APPROVAL when the proxy returns unparseable text", async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { response: "I cannot help with that." } });

    const provider = new PayGuardAIProvider({ apiKey: "pg_live_mock_123" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.confidence).toBe(0);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });
});

describe("OpenAIProvider (BYO Key)", () => {
  it("evaluates context and returns structured result", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                anomalous: false,
                confidence: 0.95,
                recommendation: "ALLOW",
                reason: "Transaction looks normal."
              })
            }
          }
        ]
      }
    });

    const provider = new OpenAIProvider({ apiKey: "sk-mock-key", model: "gpt-4o" });
    const result = await provider.investigate(mockContext);

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        model: "gpt-4o",
        response_format: { type: "json_object" }
      }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer sk-mock-key" })
      })
    );
    expect(result.recommendation).toBe("ALLOW");
    expect(result.anomalous).toBe(false);
    expect(result.confidence).toBe(0.95);
    expect(result.reason).toBe("Transaction looks normal.");
  });

  it("returns a BLOCK verdict from the model as-is", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                anomalous: true,
                confidence: 0.99,
                recommendation: "BLOCK",
                reason: "Merchant is unknown and amount is unusual."
              })
            }
          }
        ]
      }
    });

    const provider = new OpenAIProvider({ apiKey: "sk-mock-key" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.recommendation).toBe("BLOCK");
  });

  it("falls back to REQUIRE_APPROVAL when the OpenAI request fails", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("Request failed with status code 429"));

    const provider = new OpenAIProvider({ apiKey: "sk-mock-key" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.confidence).toBe(0);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });

  it("falls back to REQUIRE_APPROVAL when the reply is not valid JSON", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: { choices: [{ message: { content: "not json at all" } }] }
    });

    const provider = new OpenAIProvider({ apiKey: "sk-mock-key" });
    const result = await provider.investigate(mockContext);

    expect(result.anomalous).toBe(true);
    expect(result.recommendation).toBe("REQUIRE_APPROVAL");
  });
});

describe("AgentManager integration with AI Providers", () => {
  it("triggers PayGuardAIProvider during agent payment flow", async () => {
    const mockProxyResult = {
      anomalous: true,
      confidence: 0.9,
      recommendation: "BLOCK" as const,
      reason: "Suspicious transaction."
    };

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