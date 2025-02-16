import { Injectable } from '@nestjs/common';
import * as redis from 'redis';
import { promisify } from 'util';


@Injectable()
export class CacheService {
    private redisClient = redis.createClient();
    private getAsync = promisify(this.redisClient.get).bind(this.redisClient);
    private setAsync = promisify(this.redisClient.set).bind(this.redisClient);
    async get(key: string): Promise<string> {
        return this.getAsync(key);
    }
    async set(key: string, value: string): Promise<void> {
        return this.setAsync(key, value);
    }
}



