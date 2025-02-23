import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // For accessing JWT secret
// import { PrismaService } from '../prisma/prisma.service';
import { TypeormService } from '../typeorm/typeorm.service';
import { Users } from '../models/Users';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(@Inject() private readonly configService: ConfigService,
        // private readonly prisma: PrismaService,
        private readonly typeorm: TypeormService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET'),// || 'verysupersecret', // Get the secret from config
        });
    }

    async validate(payload: any) { // Payload is the decoded JWT payload
        // const user = await this.prisma.users.findUnique({ where: { id: payload.id } }); // Fetch the user from the database based on the payload (e.g., user ID)
        const user = await this.typeorm.getRepository(Users).findOne({ where: { id: payload.id } }); // Fetch the user from the database based on the payload (e.g., user ID)

        if (!user) {
            return payload; // Or throw an exception if you want to handle it differently
        }
        delete user.password;
        return user; // The returned user object is attached to the request object (req.user)
    }
}