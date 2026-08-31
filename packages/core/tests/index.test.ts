import { describe, expect, it } from "vitest";
import * as PayGuardLib from "../src/index";

describe("package public API", () => {
  it("exports PayGuard and AgentManager as the public entry points", () => {
    expect(PayGuardLib.PayGuard).toBeTypeOf("function");
    expect(PayGuardLib.AgentManager).toBeTypeOf("function");
  });

  it("can construct a PayGuard instance purely from the public exports", () => {
    const payguard = new PayGuardLib.PayGuard({
      razorpay: { keyId: "k", keySecret: "s" },
      storage: {
        database: "mongodb",
        connectionString: "mongodb://localhost/test",
        collectionName: "txns",
      },
    });

    expect(payguard).toBeInstanceOf(PayGuardLib.PayGuard);
    expect(payguard.agent({ id: "a1", name: "A", capabilities: [] })).toBeInstanceOf(
      PayGuardLib.AgentManager
    );
  });
});
