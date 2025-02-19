import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from 'crypto';
import { LoginReq } from "./auth.schema";
import { JwtService } from '@nestjs/jwt';
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly redisService: RedisService,
        private jwtService: JwtService,
    ) { }

    async login(cred: LoginReq) {
        const user = await this.prisma.vusers.findFirst({
            where: { email: cred.email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create hash of provided password
        const hash = crypto.createHash('sha256');
        hash.update(cred.password);
        const hashedPassword = hash.digest('hex');

        // Compare with stored hash
        if (user.pass !== hashedPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user.id, name: user.name };
        delete user.pass;

        try {
            return await this.signToken(payload);
        } catch (error) {
            throw new BadRequestException('Token generation failed');
        }
    }

    async signToken(payload: { id: number, name: string }) {
        try {
            const token = await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.JWT_SECRET,
            });
            return { access_token: token };
        } catch (error) {
            throw new BadRequestException('Token signing failed');
        }
    }


    async passwordChange(cred: LoginReq) {
        const hash = crypto.createHash('sha256');
        hash.update(cred.password);
        const hashedPass = hash.digest('hex');
        const user = await this.prisma.vusers.findFirst({
            select: { email: true, id: true },
            where: { email: cred.email },
        });
        try {
            await this.prisma.vusers.update({
                where: { id: user.id },
                data: { pass: hashedPass },
            });
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            console.log("error", error)
            throw new BadRequestException("something went wrong")
        }
    }

}

