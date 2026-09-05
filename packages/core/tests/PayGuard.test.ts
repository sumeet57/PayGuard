import { describe, expect, it } from "vitest";
import { PayGuard } from "../src/PayGuard";
import { PolicyEngine } from "../src/PolicyEngine";
import { AgentManager } from "../src/AgentManager";
import { MongoAdapter } from "../src/adapter/mongo.adapter";
import type { PayGuardConfig } from "../src/types";

function baseConfig(): PayGuardConfig {
  return {
    razorpay: { keyId: "key", keySecret: "secret" },
    storage: {
      database: "mongodb",
      connectionString: "mongodb://localhost/test",
      collectionName: "txns",
    },
  };
}

describe("PayGuard", () => {
  it("builds a PolicyEngine from the supplied policy config", () => {
    const payguard = new PayGuard(baseConfig());
    expect(payguard.policyEngine).toBeInstanceOf(PolicyEngine);
  });

  it("creates a storage adapter via StorageManager for a mongodb config", () => {
    const payguard = new PayGuard(baseConfig());
    expect(payguard.storageConfig).toBeInstanceOf(MongoAdapter);
  });

  it("defaults aiProvider to null when none is supplied", () => {
    const payguard = new PayGuard(baseConfig());
    expect(payguard.aiProvider).toBeNull();
  });

  it("stores the supplied aiProvider when provided", () => {
    const ai = {
      investigate: async () => ({
        anomalous: false,
        confidence: 1,
        recommendation: "ALLOW" as const,
        reason: "No anomaly detected",
      }),
    };
    const payguard = new PayGuard({ ...baseConfig(), ai });
    expect(payguard.aiProvider).toBe(ai);
  });

  it("throws for an unsupported storage database", () => {
    expect(
      () =>
        new PayGuard({
          ...baseConfig(),
          storage: { database: "postgresql" as any, connectionString: "x", collectionName: "y" },
        })
    ).toThrow(/Unsupported database type/);
  });

  it("retains the config it was constructed with", () => {
    const config = baseConfig();
    const payguard = new PayGuard(config);
    expect(payguard.config).toBe(config);
  });

  it("agent() returns an AgentManager bound to this PayGuard instance", () => {
    const payguard = new PayGuard(baseConfig());
    const agent = payguard.agent({ id: "a1", name: "Agent", capabilities: [] });
    expect(agent).toBeInstanceOf(AgentManager);
  });

  it("agent() creates an independent AgentManager on every call", () => {
    const payguard = new PayGuard(baseConfig());
    const agentA = payguard.agent({ id: "a1", name: "Agent A", capabilities: [] });
    const agentB = payguard.agent({ id: "a2", name: "Agent B", capabilities: [] });
    expect(agentA).not.toBe(agentB);
  });
});
