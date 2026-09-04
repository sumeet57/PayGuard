import { vi } from "vitest";
import { PayGuard } from "../src/PayGuard";
import type { AIProvider, PayGuardConfig, StorageAdapter } from "../src/types";

/**
 * A fully mocked StorageAdapter so tests never touch a real database.
 */
export function createMockStorage(): StorageAdapter & {
  connect: ReturnType<typeof vi.fn>;
  saveTransaction: ReturnType<typeof vi.fn>;
  getRecentTransactions: ReturnType<typeof vi.fn>;
  getPendingApprovals: ReturnType<typeof vi.fn>;
  updateTransactionByApprovalId: ReturnType<typeof vi.fn>;
  updateTransactionByOrderId: ReturnType<typeof vi.fn>;
} {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    saveTransaction: vi.fn().mockResolvedValue(undefined),
    getRecentTransactions: vi.fn().mockResolvedValue([]),
    getPendingApprovals: vi.fn().mockResolvedValue([]),
    updateTransactionByApprovalId: vi.fn().mockResolvedValue({}),
    updateTransactionByOrderId: vi.fn().mockResolvedValue({}),
  };
}

/**
 * A mock AIProvider that always returns the given recommendation.
 */
export function createMockAIProvider(
  recommendation: "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK"
): AIProvider & { investigate: ReturnType<typeof vi.fn> } {
  return {
    investigate: vi.fn().mockResolvedValue({
      anomalous: recommendation !== "ALLOW",
      confidence: 0.9,
      recommendation,
    }),
  };
}

/**
 * Builds a PayGuard instance with its storage adapter swapped out for a mock,
 * so no real MongoDB connection is ever attempted.
 */
export function buildPayGuard(
  overrides: Partial<Omit<PayGuardConfig, "storage">> = {},
  storage: StorageAdapter = createMockStorage()
): PayGuard {
  const payguard = new PayGuard({
    razorpay: { keyId: "test_key", keySecret: "test_secret" },
    storage: {
      database: "mongodb",
      connectionString: "mongodb://localhost/test",
      collectionName: "transactions",
    },
    ...overrides,
  });

  // Swap the real MongoAdapter created internally for our mock.
  payguard.storageConfig = storage;
  return payguard;
}
