import { beforeEach, describe, expect, it, vi } from "vitest";

const connectMock = vi.fn().mockResolvedValue(undefined);
vi.mock("mongoose", () => ({
  default: {
    connect: (...args: unknown[]) => connectMock(...args),
  },
}));

const createMock = vi.fn().mockResolvedValue(undefined);
const findMock = vi.fn();
vi.mock("../src/store/MongoTransaction", () => ({
  MongoTransaction: {
    create: (...args: unknown[]) => createMock(...args),
    find: (...args: unknown[]) => findMock(...args),
  },
}));

const { MongoAdapter } = await import("../src/adapter/mongo.adapter");

describe("MongoAdapter", () => {
  beforeEach(() => {
    connectMock.mockClear();
    createMock.mockClear();
    findMock.mockClear();
  });

  it("connects using the configured URI", async () => {
    const adapter = new MongoAdapter("mongodb://localhost/test");
    await adapter.connect();

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledWith("mongodb://localhost/test");
    expect(adapter.isConnected).toBe(true);
  });

  it("does not reconnect if already connected", async () => {
    const adapter = new MongoAdapter("mongodb://localhost/test");
    await adapter.connect();
    await adapter.connect();

    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it("saves a transaction via MongoTransaction.create", async () => {
    const adapter = new MongoAdapter("mongodb://localhost/test");
    const txn = {
      transactionId: "pg_txn_1",
      agentId: "a1",
      amount: 100,
      status: "EXECUTING",
      decision: "ALLOW",
    };

    await adapter.saveTransaction(txn);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith(txn);
  });

  it("fetches recent transactions sorted by createdAt desc, limited correctly", async () => {
    const execMock = vi.fn().mockResolvedValue([{ transactionId: "pg_txn_1" }]);
    const limitMock = vi.fn(() => ({ exec: execMock }));
    const sortMock = vi.fn(() => ({ limit: limitMock }));
    findMock.mockReturnValue({ sort: sortMock });

    const adapter = new MongoAdapter("mongodb://localhost/test");
    const result = await adapter.getRecentTransactions("agent-1", 5);

    expect(findMock).toHaveBeenCalledWith({ agentId: "agent-1" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limitMock).toHaveBeenCalledWith(5);
    expect(result).toEqual([{ transactionId: "pg_txn_1" }]);
  });
});
