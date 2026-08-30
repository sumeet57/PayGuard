import { PayGuardConfig, AgentConfig, AIProvider, StorageConfig, StorageAdapter } from "./types";
import { AgentManager } from "./AgentManager";
import { PolicyEngine } from "./PolicyEngine";
import { StorageManager } from "./StorageManager";

export class PayGuard {
  public config: PayGuardConfig;
  public policyEngine: PolicyEngine;
  public storageConfig: StorageAdapter;
  public aiProvider: AIProvider | null;

 constructor (config: PayGuardConfig) {
    this.config = config;
    this.policyEngine = new PolicyEngine(config.policy);
    this.storageConfig = StorageManager.createStorageAdapter(config.storage);
    this.aiProvider = config.ai || null;
  }

  public agent(config: AgentConfig): AgentManager {
    return new AgentManager(this, config);
  }
}