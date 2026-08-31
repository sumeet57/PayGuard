import { describe, expect, it } from "vitest";
import { StorageManager } from "../src/StorageManager";
import { MongoAdapter } from "../src/adapter/mongo.adapter";

describe("StorageManager.createStorageAdapter", () => {
  it("returns a MongoAdapter for a mongodb config", () => {
    const adapter = StorageManager.createStorageAdapter({
      database: "mongodb",
      connectionString: "mongodb://localhost/test",
      collectionName: "txns",
    });
    expect(adapter).toBeInstanceOf(MongoAdapter);
  });

  it("throws a descriptive error for postgresql (not yet implemented)", () => {
    expect(() =>
      StorageManager.createStorageAdapter({
        database: "postgresql",
        connectionString: "postgres://localhost/test",
        collectionName: "txns",
      })
    ).toThrow("Unsupported database type: postgresql");
  });

  it("throws a descriptive error for mysql (not yet implemented)", () => {
    expect(() =>
      StorageManager.createStorageAdapter({
        database: "mysql",
        connectionString: "mysql://localhost/test",
        collectionName: "txns",
      })
    ).toThrow("Unsupported database type: mysql");
  });
});
