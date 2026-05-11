import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class AnalyticsCacheService implements OnModuleDestroy {
  private readonly memoryCache = new Map<string, { expiresAt: number; value: string }>();
  private readonly redis?: Redis;
  private readonly ttlSeconds = Number(process.env.ANALYTICS_CACHE_TTL_SECONDS ?? 120);

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (redisUrl) {
      this.redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    } else if (redisHost) {
      this.redis = new Redis({
        host: redisHost,
        port: Number(process.env.REDIS_PORT ?? 6379),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
    }

    this.redis?.on("error", () => {
      // Redis is an optimization for the ВКР demo, so the API keeps working with memory cache.
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const namespacedKey = this.key(key);
    const cached = await this.getRaw(namespacedKey);
    return cached ? (JSON.parse(cached) as T) : undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const namespacedKey = this.key(key);
    const serialized = JSON.stringify(value);

    if (this.redis) {
      try {
        if (this.redis.status === "wait") {
          await this.redis.connect();
        }
        await this.redis.set(namespacedKey, serialized, "EX", this.ttlSeconds);
        return;
      } catch {
        this.setMemory(namespacedKey, serialized);
        return;
      }
    }

    this.setMemory(namespacedKey, serialized);
  }

  async onModuleDestroy() {
    if (this.redis && this.redis.status !== "end") {
      await this.redis.quit();
    }
  }

  private async getRaw(key: string): Promise<string | undefined> {
    if (this.redis) {
      try {
        if (this.redis.status === "wait") {
          await this.redis.connect();
        }

        return (await this.redis.get(key)) ?? undefined;
      } catch {
        return this.getMemory(key);
      }
    }

    return this.getMemory(key);
  }

  private getMemory(key: string) {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return undefined;
    }

    if (cached.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  private setMemory(key: string, value: string) {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlSeconds * 1000,
    });
  }

  private key(key: string) {
    return `edvs:analytics:${key}`;
  }
}
