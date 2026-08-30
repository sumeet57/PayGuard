import mongoose from "mongoose";
import { MongoTransaction } from "../store/MongoTransaction";
import { StorageAdapter } from "../types";


export class MongoAdapter implements StorageAdapter {

    private uri : string;
    public isConnected: boolean = false;

    constructor(uri: string) {
        this.uri = uri;
    };

    async connect() : Promise<void> {
        if(!this.isConnected) {
            await mongoose.connect(this.uri);
            this.isConnected = true;
        }
    };
    async saveTransaction(data: any): Promise<void> {
        await MongoTransaction.create(data);
    };
    async getRecentTransactions(agentId: string, limit: 5): Promise<any[]> {
        return await MongoTransaction.find({ agentId }).sort({ createdAt: -1 }).limit(limit).exec();
    };
}
