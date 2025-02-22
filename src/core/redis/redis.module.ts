import { Global, Module } from '@nestjs/common';
// import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisConfigService } from './redis.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    // NestRedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'single',
    //     options: {
    //       host: configService.get<string>('REDIS_HOST'),
    //       port: configService.get<number>('REDIS_PORT'),
    //       password: configService.get<string>('REDIS_PASSWORD'),
    //     }
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  providers: [RedisService,RedisConfigService,ConfigService],
  exports: [RedisService],
})
export class RedisModule {}