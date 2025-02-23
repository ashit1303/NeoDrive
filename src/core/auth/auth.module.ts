import { Module } from '@nestjs/common';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
// import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule
import { RedisModule } from '../redis/redis.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        // PrismaModule,
        ConfigModule, // Make ConfigModule available here
        PassportModule,
        RedisModule,
        JwtModule
        // .registerAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (configService: ConfigService) => ({
        //         secret: configService.get<string>('JWT_SECRET') ||'itsecret' ,
        //         signOptions: { expiresIn: '7d' },
        //     }),
        // }),
    ],
    controllers: [AuthController],
    providers: [AuthService,JwtStrategy],
})
export class AuthModule { }
