/**
 * In-memory cache with TTL for audit results.
 * Dramatically speeds up repeat audits (1hr cache).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class AuditCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly TTL = 60 * 60 * 1000; // 1 hour

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, { data, expiresAt: Date.now() + this.TTL });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    // Clean expired entries
    for (const [key, entry] of this.store) {
      if (Date.now() > entry.expiresAt) this.store.delete(key);
    }
    return this.store.size;
  }

  getAge(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Date.now() - (entry.expiresAt - this.TTL);
  }
}

// Singleton
export const auditCache = new AuditCache();
