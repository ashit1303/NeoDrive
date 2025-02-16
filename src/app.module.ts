import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { MailerModule } from './mailer/mailer.module';
import { FileModule } from './file/file.module';
import { LoggerService } from './logger/logger.service';
import { CacheService } from './cache/cache.service';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ AuthModule, MailerModule,  FileModule, UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, SearchController, AuthController],
  providers: [AppService, AuthService, PrismaService, LoggerService, CacheService, SearchService,JwtService],
})
export class AppModule {}
