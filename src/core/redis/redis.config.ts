import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import { ZincLogger } from '../logger/zinc.service';


@Injectable()
export class RedisConfigService {
  constructor(
    private configService: ConfigService,
    private logger: ZincLogger,
  ) {}

  getClient(): ReturnType<typeof redis.createClient> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = parseInt(this.configService.get<string>('REDIS_PORT'), 10);

    const client = redis.createClient({ socket: { host, port } });

    client.on('error', (err) => {
      // Handle Redis client errors
      // retry connection
      try { client.connect() }
      catch (error) {this.logger.error('Redis Client Error', error.message);}
      // console.error('Redis Client Error', err);
    });

    client.connect();

    return client;
  }
}