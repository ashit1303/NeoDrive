import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { PrismaService } from './core/prisma/prisma.service';
import { MailerModule } from './core/mailer/mailer.module';
import { FileModule } from './file/file.module';
import { LoggerService } from './core/logger/logger.service';
import { SearchService } from './core/sonic/search.service';
import { SearchController } from './core/sonic/search.controller';
import { AuthController } from './core/auth/auth.controller';
import { AuthService } from './core/auth/auth.service';
import { UserModule } from './user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './core/redis/redis.service';
import { RedisConfigService } from './core/redis/redis.config';
import { log } from 'console';
log('process.env.NODE_ENV', process.env.NODE_ENV);
@Module({
  imports: [ 
    ConfigModule.forRoot({
      envFilePath: `.env-${process.env.NODE_ENV || 'dev'}`, // Dynamically loads .env file
      cache: false,  // Caches the .env file
      ignoreEnvFile: true,  // Ignores the .env file
      // envFilePath: null,
      isGlobal: true,  // Makes ConfigService available globally
    }),
    AuthModule, MailerModule, FileModule, UserModule,
  ],
  controllers: [AppController, SearchController, AuthController],
  providers: [AppService, AuthService, PrismaService, LoggerService, SearchService, JwtService, RedisService, RedisConfigService,],
})

export class AppModule {}