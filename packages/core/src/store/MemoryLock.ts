export class MemoryLockStore {
  private locks: Map<string, number> = new Map();
  private defaultTtlMs: number;

  constructor(ttlSeconds: number = 30) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  public lock(key: string): boolean {
    const now = Date.now();
    const expiresAt = this.locks.get(key);

    if (expiresAt && expiresAt > now) {
      return false; // Key is already locked
    }

    this.locks.set(key, now + this.defaultTtlMs);
    return true; // Lock acquired
  }

  public unlock(key: string): void {
    this.locks.delete(key);
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, expiresAt] of this.locks.entries()) {
      if (expiresAt <= now) {
        this.locks.delete(key);
      }
    }
  }
}