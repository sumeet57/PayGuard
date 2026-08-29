import { PayGuardConfig, AgentConfig, AIProvider } from "./types";
import { AgentManager } from "./AgentManager";
import { PolicyEngine } from "./PolicyEngine";

export class PayGuard {
  public config: PayGuardConfig;
  public policyEngine: PolicyEngine;
  public aiProvider: AIProvider | null;

  constructor(config: PayGuardConfig) {
    this.config = config;
    this.policyEngine = new PolicyEngine(config.policy);
    this.aiProvider = config.ai || null;
  }

  public agent(config: AgentConfig): AgentManager {
    return new AgentManager(this, config);
  }
}