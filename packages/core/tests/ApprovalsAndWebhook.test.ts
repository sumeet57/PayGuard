import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildPayGuard, createMockStorage } from "./helpers";
import { RazorpayWebhookHandler } from "../src/webhook/RazorpayWebhookHandler";
import crypto from "crypto";

describe("PayGuard Approvals API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists pending approval transactions from storage", async () => {
    const storage = createMockStorage();
    const mockPendingTxns = [
      { approvalId: "apr_101", amount: 20000, status: "WAITING_FOR_APPROVAL" }
    ];
    storage.getPendingApprovals.mockResolvedValue(mockPendingTxns);

    const payguard = buildPayGuard({}, storage);
    const pending = await payguard.approvals.listPending();

    expect(storage.getPendingApprovals).toHaveBeenCalledTimes(1);
    expect(pending).toHaveLength(1);
    expect(pending[0].approvalId).toBe("apr_101");
  });

  it("approves a pending transaction and updates status to APPROVED", async () => {
    const storage = createMockStorage();
    storage.updateTransactionByApprovalId.mockResolvedValue({
      approvalId: "apr_101",
      status: "APPROVED"
    });

    const payguard = buildPayGuard({}, storage);
    const result = await payguard.approvals.approve("apr_101", "Overridden by Security Admin");

    expect(storage.updateTransactionByApprovalId).toHaveBeenCalledWith(
      "apr_101",
      "APPROVED",
      "Overridden by Security Admin"
    );
    expect(result.status).toBe("APPROVED");
  });

  it("rejects a pending transaction and updates status to BLOCKED", async () => {
    const storage = createMockStorage();
    storage.updateTransactionByApprovalId.mockResolvedValue({
      approvalId: "apr_102",
      status: "BLOCKED"
    });

    const payguard = buildPayGuard({}, storage);
    const result = await payguard.approvals.reject("apr_102", "Suspicious agent request");

    expect(storage.updateTransactionByApprovalId).toHaveBeenCalledWith(
      "apr_102",
      "BLOCKED",
      "Suspicious agent request"
    );
    expect(result.status).toBe("BLOCKED");
  });
});

describe("RazorpayWebhookHandler", () => {
  const webhookSecret = "test_webhook_secret_123";

  function generateSignature(payload: string, secret: string) {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully verifies valid HMAC signature and updates order status to SUCCESS on payment.captured", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const handler = new RazorpayWebhookHandler(payguard);

    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_12345",
            order_id: "order_mock_999"
          }
        }
      }
    });

    const signature = generateSignature(rawBody, webhookSecret);

    const response = await handler.handleWebhook({
      webhookSecret,
      rawBody,
      signature
    });

    expect(response.status).toBe("PROCESSED");
    expect(response.event).toBe("payment.captured");
    expect(storage.updateTransactionByOrderId).toHaveBeenCalledWith("order_mock_999", "SUCCESS");
  });

  it("updates order status to FAILED on payment.failed event", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const handler = new RazorpayWebhookHandler(payguard);

    const rawBody = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_12345",
            order_id: "order_mock_888"
          }
        }
      }
    });

    const signature = generateSignature(rawBody, webhookSecret);

    await handler.handleWebhook({
      webhookSecret,
      rawBody,
      signature
    });

    expect(storage.updateTransactionByOrderId).toHaveBeenCalledWith("order_mock_888", "FAILED");
  });

  it("rejects invalid webhook signatures and throws an error", async () => {
    const storage = createMockStorage();
    const payguard = buildPayGuard({}, storage);
    const handler = new RazorpayWebhookHandler(payguard);

    const rawBody = JSON.stringify({ event: "payment.captured" });
    const invalidSignature = "invalid_signature_hash";

    await expect(
      handler.handleWebhook({
        webhookSecret,
        rawBody,
        signature: invalidSignature
      })
    ).rejects.toThrow("Invalid Razorpay webhook signature.");

    expect(storage.updateTransactionByOrderId).not.toHaveBeenCalled();
  });
});