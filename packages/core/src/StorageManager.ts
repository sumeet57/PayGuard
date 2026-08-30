import { StorageAdapter, StorageConfig } from "./types";
import { MongoAdapter } from "./adapter/mongo.adapter";

export class StorageManager {
  static createStorageAdapter(config: StorageConfig): StorageAdapter {
    switch (config.database) {
      case "mongodb":
        return new MongoAdapter(config.connectionString);
      default:
        throw new Error(`Unsupported database type: ${config.database}`);
    }
  }
}