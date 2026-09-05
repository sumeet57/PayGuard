import crypto from "crypto";
import { PayGuard } from "../PayGuard";

export interface WebhookOptions {
  webhookSecret: string;
  rawBody: string | Buffer;
  signature: string;
}

export class RazorpayWebhookHandler {
  private payguard: PayGuard;

  constructor(payguard: PayGuard) {
    this.payguard = payguard;
  }

  public verifySignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);


  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

  public async handleWebhook(options: WebhookOptions): Promise<{ status: string; event: string }> {
    const isValid = this.verifySignature(options.rawBody, options.signature, options.webhookSecret);
    
    if (!isValid) {
      throw new Error("Invalid Razorpay webhook signature.");
    }

    const payload = typeof options.rawBody === "string" 
      ? JSON.parse(options.rawBody) 
      : JSON.parse(options.rawBody.toString("utf-8"));

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (!orderId) {
      return { status: "IGNORED", event };
    }

    const storage = this.payguard.storageConfig;
    if (storage) {
      await storage.connect();

      if (event === "payment.captured" || event === "order.paid") {
        await storage.updateTransactionByOrderId(orderId, "SUCCESS");
      } else if (event === "payment.failed") {
        await storage.updateTransactionByOrderId(orderId, "FAILED");
      }
    }

    return { status: "PROCESSED", event };
  }
}