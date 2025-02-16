import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';


@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  getClient(): ReturnType<typeof redis.createClient> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = parseInt(this.configService.get<string>('REDIS_PORT'), 10);

    const client = redis.createClient({ socket: { host, port } });

    client.on('error', (err) => {
      // Handle Redis client errors
      // retry connection
      // try { client.connect()}
      // catch (error) {console.error('Redis Client Error', error);}
      // console.error('Redis Client Error', err);
    });

    client.connect();

    return client;
  }
}