interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  generateKey(params: Record<string, any>): string {
    return JSON.stringify(params, Object.keys(params).sort());
  }
  
  set<T>(key: string, data: T, expiresInMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();
