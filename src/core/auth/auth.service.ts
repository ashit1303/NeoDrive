import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from "../prisma/prisma.service";
import * as crypto from 'crypto';
import { LoginReq } from "./auth.schema";
import { JwtService } from '@nestjs/jwt';
import { RedisService } from "../redis/redis.service";
import { TypeormService } from "../typeorm/typeorm.service";
import { Users } from "../../core/models/Users";

@Injectable()
export class AuthService {
    constructor(
        // private prisma: PrismaService,
        private typeorm: TypeormService,
        private readonly redisService: RedisService,
        private jwtService: JwtService,
    ) { }

    async login(cred: LoginReq) {
        const user = await this.typeorm.getRepository(Users).findOne({ where: { email: cred.email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create hash of provided password
        const hash = crypto.createHash('sha256');
        hash.update(cred.password);
        const hashedPassword = hash.digest('hex');
        // Compare with stored hash
        if (user.password !== hashedPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user.id, name: user.name };
        delete user.password;

                //  await this.typeorm..findFirst({
        //     where: { email: cred.email },
        // });
            
        // async findOne(id: number): Promise<User> {
        //     return this.typeorm.getRepository(User).findOne({ where: { id } });
        // }
    
        // async create(user: Partial<User>): Promise<User> {
        //     const userRepo = this.typeorm.getRepository(User);
        //     const newUser = userRepo.create(user);
        //     return userRepo.save(newUser);
        // }
        try {
            return await this.signToken(payload);
        } catch (error) {
            throw new BadRequestException('Token generation failed');
        }
    }

    async signToken(payload: { id: string, name: string }) {
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
        const user = await this.typeorm.getRepository(Users).findOne({ where: { email: cred.email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        try {
            await this.typeorm.getRepository(Users).update({ id: user.id }, { password: hashedPass });
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            console.log("error", error)
            throw new BadRequestException("something went wrong")
        }
    }

}

