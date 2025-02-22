import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
// import { PrismaService } from "../prisma/prisma.service";
import * as crypto from 'crypto';
import { authPayloadDTO, LoginReqDTO } from "./auth.schema";
import { JwtService } from '@nestjs/jwt';
import { RedisService } from "../redis/redis.service";
import { TypeormService } from "../typeorm/typeorm.service";
import { Users } from "../models/Users";

@Injectable()
export class AuthService {
    constructor(
        // private prisma: PrismaService,
        private typeorm: TypeormService,
        private readonly redisService: RedisService,
        private jwtService: JwtService,
    ) { }

    async login(cred: LoginReqDTO) {
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

        const payload = { id: user.id, username: user.username, email:user.email };
        // delete user.password;

        //  await this.typeorm.getRepository(User).findFirst({
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

    async signToken(payload: authPayloadDTO) {
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

    async register(cred: LoginReqDTO) {
        const user = await this.typeorm.getRepository(Users).findOne({ where: { email: cred.email } });
        if (user) {
            throw new BadRequestException('User already exists');
        }
        //get username from email
        const username = cred.email.split('@')[0]

        const hash = crypto.createHash('sha256');
        hash.update(cred.password);
        const hashedPass = hash.digest('hex');
        try {
            await this.typeorm.getRepository(Users).save({ email: cred.email, password: hashedPass, username });
            return { success: true, message: 'User registered successfully' };
        } catch (error) {
            console.log("error", error)
            throw new BadRequestException("something went wrong")
        }
    }

    async passwordChange(cred: LoginReqDTO) {
        const hash = crypto.createHash('sha256');
        hash.update(cred.password);
        const hashedPass = hash.digest('hex');
        const user = await this.typeorm.getRepository(Users).findOne({ where: { email: cred.email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        try {
            await this.typeorm.getRepository(Users).update({ id: user.id }, { password: hashedPass });
            return { success: true };
        } catch (error) {
            console.log("error", error)
            throw new BadRequestException("something went wrong")
        }
    }

}

