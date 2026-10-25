import { PayGuard, GeminiProvider, ReconciliationWorker } from "payguard";

const payguard = new PayGuard({
    razorpay: {
        keyId: process.env.RPID,
        keySecret: process.env.RPSCT
    },
    storage: {
        collectionName: "payguardtransactions",
        connectionString: process.env.MONGO_URI,
        database: 'mongodb'
    },
    policy: {
        maxTransactionAmount: 10000,
        requireApprovalAbove: 5000,
    },
    ai: new GeminiProvider({
        apiKey: process.env.GEMINIAPI,
        model: 'gemma-4-31b-it'
    })
})