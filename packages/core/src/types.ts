export interface PayGuardConfig {
  razorpay: {
    keyId: string;
    keySecret: string;
  };
  policy?: PolicyConfig;
  storage: StorageConfig;
  ai?: AIProvider;
}

export interface PolicyConfig {
  maxTransactionAmount?: number;
  dailySpendingLimit?: number;
  requireApprovalAbove?: number;
}

export interface StorageConfig {
  database : 'mongodb' | 'postgresql' | 'mysql';
  connectionString: string;
  collectionName: string;
}
export interface StorageAdapter {
  connect(): Promise<void>;
  saveTransaction(data: any): Promise<void>;
  getRecentTransactions(agentId: string, limit?: number): Promise<any[]>;
  
}

export interface AIProvider {
  investigate(context: InvestigationContext): Promise<InvestigationResult>;
}

export interface InvestigationContext {
  agentId: string;
  amount: number;
  merchant: { id: string };
  reason?: string;
  recentTransactions: any[];
}

export interface InvestigationResult {
  anomalous: boolean;
  confidence: number;
  recommendation: "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK";
}

export interface AgentConfig {
  id: string;
  name: string;
  capabilities: string[];
  policy?: PolicyConfig;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  merchant: { id: string };
  reason?: string;
  idempotencyKey: string;
}

export type PaymentResult = 
  | { decision: "ALLOW"; transactionId: string; status: string, reason?: string, orderId?: string }
  | { decision: "REQUIRE_APPROVAL"; transactionId: string; approvalId: string; status: string; reason: string }
  | { decision: "BLOCK"; transactionId: string; status: string; reason: string };