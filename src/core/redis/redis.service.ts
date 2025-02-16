import { Injectable } from '@nestjs/common';
import * as redis from 'redis';
import { RedisConfigService } from './redis.config';


@Injectable()
export class RedisService {
  private client: ReturnType<typeof redis.createClient>;

  constructor(private redisConfigService: RedisConfigService) {
    this.client = this.redisConfigService.getClient();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  // Add more methods as needed (e.g., del, hget, hset, etc.)
}