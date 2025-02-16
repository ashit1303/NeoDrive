import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2';
import { LoginReq } from "./auth.schema";
import { JwtService } from '@nestjs/jwt';


@Injectable({})

export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(cred: LoginReq) {
        const user = await this.prisma.vusers.findFirst({
            where: { email: cred.email },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isValid = await argon.verify(user.pass, cred.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { id: user.id, name: user.name };
        delete user.pass;
        try{
        return this.signToken(payload);
        }
        catch(rr){

        }
    }

    async signToken(payload: { id : number, name: string }) {
        try{
            return { access_token: await this.jwtService.signAsync(payload, { expiresIn: '7d',
            secret: process.env.JWT_SECRET,
            }) };
        }
        catch(err){

        }
    }

    async passwordChange(cred: LoginReq) {
        const hashedPass = await argon.hash(cred.password);
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