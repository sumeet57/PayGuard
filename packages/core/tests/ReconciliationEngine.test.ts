import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildPayGuard, createMockStorage } from "./helpers";
import { ReconciliationWorker } from "../src/ReconciliationEngine";
import Razorpay from "razorpay";

vi.mock("razorpay");

describe("ReconciliationWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reconciles EXECUTING transaction to SUCCESS when Razorpay order status is paid", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);

    const unresolvedTxns = [
      {
        transactionId: "pg_txn_101",
        orderId: "order_rzp_101",
        status: "UNKNOWN"
      }
    ];

    storage.getUnresolvedTransactions.mockResolvedValueOnce(unresolvedTxns);

    const mockFetch = vi.fn().mockResolvedValue({
      id: "order_rzp_101",
      status: "paid",
      attempts: 1
    });

    // Use regular function to support 'new' operator
    (Razorpay as any).mockImplementation(function () {
      return { orders: { fetch: mockFetch } };
    });

    const worker = new ReconciliationWorker(payguard);
    const result = await worker.runReconciliation();

    expect(storage.getUnresolvedTransactions).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith("order_rzp_101");
    expect(storage.updateTransactionByOrderId).toHaveBeenCalledWith("order_rzp_101", "SUCCESS");
    expect(result.reconciledCount).toBe(1);
  });

  it("reconciles transaction to FAILED when Razorpay order has failed attempts", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);

    const unresolvedTxns = [
      {
        transactionId: "pg_txn_102",
        orderId: "order_rzp_102",
        status: "EXECUTING"
      }
    ];

    storage.getUnresolvedTransactions.mockResolvedValueOnce(unresolvedTxns);

    const mockFetch = vi.fn().mockResolvedValue({
      id: "order_rzp_102",
      status: "attempted",
      attempts: 4
    });

    (Razorpay as any).mockImplementation(function () {
      return { orders: { fetch: mockFetch } };
    });

    const worker = new ReconciliationWorker(payguard);
    const result = await worker.runReconciliation();

    expect(storage.updateTransactionByOrderId).toHaveBeenCalledWith("order_rzp_102", "FAILED");
    expect(result.reconciledCount).toBe(1);
  });

  it("skips updating transactions if Razorpay order is still created or active", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);

    const unresolvedTxns = [
      {
        transactionId: "pg_txn_103",
        orderId: "order_rzp_103",
        status: "EXECUTING"
      }
    ];

    storage.getUnresolvedTransactions.mockResolvedValueOnce(unresolvedTxns);

    const mockFetch = vi.fn().mockResolvedValue({
      id: "order_rzp_103",
      status: "created",
      attempts: 0
    });

    (Razorpay as any).mockImplementation(function () {
      return { orders: { fetch: mockFetch } };
    });

    const worker = new ReconciliationWorker(payguard);
    const result = await worker.runReconciliation();

    expect(storage.updateTransactionByOrderId).not.toHaveBeenCalled();
    expect(result.reconciledCount).toBe(0);
  });
});