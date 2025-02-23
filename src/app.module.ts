import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
// import { PrismaService } from './core/prisma/prisma.service';
import { MailerModule } from './core/mailer/mailer.module';
import { FileModule } from './file/file.module';
import { SonicService } from './core/sonic/sonic.service';
import { AuthController } from './core/auth/auth.controller';
import { AuthService } from './core/auth/auth.service';
import { UserModule } from './user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './core/redis/redis.service';
import { RedisConfigService } from './core/redis/redis.config';
import { log } from 'console';
import { SonicModule } from './core/sonic/sonic.module';
import { TypeormModule } from './core/typeorm/typeorm.module';
import { ShortenerModule } from './shortener/shortener.module';
import { LoggerMiddleware } from './core/logger/logger.middleware';
// import { VectorLogger } from './core/logger/vector.service';
import { ZincLogger } from './core/logger/zinc.service';
// import { ResponseModifierMiddleware } from './core/response.interceptor';
log('process.env.NODE_ENV', process.env.NODE_ENV);
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,  // Makes ConfigService available globally
    // envFilePath: `.env-${process.env.NODE_ENV || 'dev'}`, // Dynamically loads .env file
    cache: false,  // Caches the .env file
    ignoreEnvFile: true,  // Ignores the .env file
    // envFilePath: null,
  }),
    TypeormModule, AuthModule, MailerModule, FileModule, UserModule, SonicModule, ShortenerModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, SonicService, JwtService, RedisService, RedisConfigService, ConfigService,  ZincLogger],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer ) {
    /**
     * The LoggerMiddleware is applied globally (for all routes).
     * The `forRoutes('*')` method applies the middleware to all routes.
     * The `*` is a glob pattern that matches all routes.
     */
    // consumer.apply(ResponseModifierMiddleware).forRoutes('*')
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
