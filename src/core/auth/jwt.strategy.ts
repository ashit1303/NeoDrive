import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // For accessing JWT secret
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET'), // Get the secret from config
        });
    }

    async validate(payload: any) { // Payload is the decoded JWT payload
        const user = await this.prisma.users.findUnique(payload.id); // Fetch the user from the database based on the payload (e.g., user ID)

        if (!user) {
            return null; // Or throw an exception if you want to handle it differently
        }

        return user; // The returned user object is attached to the request object (req.user)
    }
}