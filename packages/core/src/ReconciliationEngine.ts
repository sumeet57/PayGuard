import { PayGuard } from "./PayGuard";
import Razorpay from "razorpay";

export class ReconciliationWorker {
    private payguard: PayGuard;
    private razorpay: Razorpay;

    constructor(payguard: PayGuard) {
        this.payguard = payguard;
        this.razorpay = new Razorpay({
            key_id: payguard.config.razorpay.keyId,
            key_secret: payguard.config.razorpay.keySecret,
        });
    }

    public async runReconciliation(timeoutMinutes = 15): Promise<{ reconciledCount: number }> {
        const storage = this.payguard.storageConfig;
        if (!storage) return { reconciledCount: 0 };

        await storage.connect();
        const pendingTxns = await storage.getUnresolvedTransactions();
        let reconciledCount = 0;

        const now = Date.now();

        for (const txn of pendingTxns) {
            if (!txn.orderId) continue;

            try {
                const order: any = await this.razorpay.orders.fetch(txn.orderId);
                const createdAt = new Date(txn.createdAt || order.created_at * 1000).getTime();
                const isExpired = (now - createdAt) > timeoutMinutes * 60 * 1000;

                if (order.status === "paid") {
                    await storage.updateTransactionByOrderId(txn.orderId, "SUCCESS");
                    reconciledCount++;
                } else if (order.status === "attempted" && order.attempts > 3) {
                    await storage.updateTransactionByOrderId(txn.orderId, "FAILED");
                    reconciledCount++;
                } else if ((order.status === "created" || order.status === "attempted") && isExpired) {
                    // Mark abandoned orders older than timeout as FAILED/EXPIRED
                    await storage.updateTransactionByOrderId(txn.orderId, "EXPIRED");
                    reconciledCount++;
                }
            } catch (err: any) {
                console.error(`[Reconciliation Error] Order ${txn.orderId}:`, err.message);
            }
        }

        return { reconciledCount };
    }
}