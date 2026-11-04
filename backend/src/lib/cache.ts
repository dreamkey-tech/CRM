import { Redis } from '@upstash/redis'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class HybridCache {
  private memoryStore = new Map<string, CacheEntry<any>>()
  private redis: Redis | null = null
  private redisUrl: string | null = null

  /**
   * Dynamically initializes or updates the Upstash Redis client.
   * Safe to call multiple times with the same or missing credentials.
   */
  initRedis(url?: string, token?: string): void {
    if (!url || !token || (this.redis && this.redisUrl === url)) return
    try {
      this.redisUrl = url
      this.redis = new Redis({ url, token })
    } catch (err) {
      console.warn('[Cache] Failed to initialize Upstash Redis:', err)
    }
  }

  /**
   * Fast synchronous check in local L1 memory.
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryStore.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key)
      return null
    }
    return entry.value as T
  }

  /**
   * Returns latest known value from memory, even if expired.
   * Useful as resilient fallback when DB / Redis is temporarily unreachable.
   */
  getLatest<T>(key: string): T | null {
    const entry = this.memoryStore.get(key)
    return entry ? (entry.value as T) : null
  }

  /**
   * Multi-tier retrieval:
   * 1. Check L1 Memory (0ms)
   * 2. If Miss and Redis available: Check Upstash Redis (~15ms)
   * 3. Populate L1 on Redis hit
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. Check L1 in-memory
    const memVal = this.getFromMemory<T>(key)
    if (memVal !== null) return memVal

    // 2. Check L2 Upstash Redis
    if (this.redis) {
      try {
        const redisVal = await this.redis.get<T>(key)
        if (redisVal !== null && redisVal !== undefined) {
          // Cache in L1 memory for 30s to minimize subsequent HTTP calls
          this.setMemory(key, redisVal, 30_000)
          return redisVal
        }
      } catch (err) {
        console.warn(`[Cache] Redis GET error for "${key}":`, err)
      }
    }

    return null
  }

  /**
   * Sets value in local L1 memory.
   */
  private setMemory<T>(key: string, value: T, ttlMs = 30_000): void {
    if (this.memoryStore.size > 1000) {
      const now = Date.now()
      for (const [k, v] of this.memoryStore.entries()) {
        if (now > v.expiresAt) this.memoryStore.delete(k)
      }
      if (this.memoryStore.size > 800) {
        const keysToDelete = Array.from(this.memoryStore.keys()).slice(0, 200)
        for (const k of keysToDelete) this.memoryStore.delete(k)
      }
    }
    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  /**
   * Multi-tier write:
   * Writes to both L1 Memory and Upstash Redis.
   */
  async set<T>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    // 1. Write to L1 Memory
    this.setMemory(key, value, ttlMs)

    // 2. Write to Upstash Redis
    if (this.redis) {
      try {
        const ttlSec = Math.max(1, Math.round(ttlMs / 1000))
        await this.redis.set(key, value, { ex: ttlSec })
      } catch (err) {
        console.warn(`[Cache] Redis SET error for "${key}":`, err)
      }
    }
  }

  /**
   * Multi-tier delete:
   * Evicts from both L1 Memory and Upstash Redis.
   */
  async delete(key: string): Promise<void> {
    this.memoryStore.delete(key)
    if (this.redis) {
      try {
        await this.redis.del(key)
      } catch (err) {
        console.warn(`[Cache] Redis DEL error for "${key}":`, err)
      }
    }
  }

  /**
   * Multi-tier prefix eviction:
   * Evicts all keys starting with prefix from L1 Memory and Upstash Redis.
   */
  async deletePrefix(prefix: string): Promise<void> {
    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryStore.delete(key)
      }
    }

    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${prefix}*`)
        if (keys && keys.length > 0) {
          await this.redis.del(...keys)
        }
      } catch (err) {
        console.warn(`[Cache] Redis DEL prefix error for "${prefix}":`, err)
      }
    }
  }

  clear(): void {
    this.memoryStore.clear()
  }

  async wrap<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached
    const value = await fetcher()
    await this.set(key, value, ttlMs)
    return value
  }
}

export const cache = new HybridCache()
