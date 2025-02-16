import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const loginReq = Joi.object({
    email: Joi.string().email().description('User email').example('exp@any.com'),
    password: Joi.string().required().description('User password').example('pass')
}).or('email', 'mobile');

export interface LoginReq { // For type safety
    email?:string;
    password: string;
}

export class LoginRes {
    @ApiProperty({ description: 'User token' })
    token: string;
}

export class BasicResponse {
    @ApiProperty({ description: 'Success' })
    success: boolean;
    @ApiProperty({ description: 'Message' })
    message: string;
}