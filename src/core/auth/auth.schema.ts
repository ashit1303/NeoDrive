import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Min } from 'class-validator';
import * as Joi from 'joi';

// export const loginReq = Joi.object({
//     email: Joi.string().email().description('User email').example('exp@any.com'),
//     password: Joi.string().required().description('User password').example('pass')
// }).or('email', 'mobile');

export class LoginReq { // For type safety
    @ApiProperty({ description: 'Email'})
    @IsEmail()
    email:string;
    @ApiProperty({description: 'Pass'})
    @Min(6)
    password: string;
}

export class LoginRes {
    @ApiProperty({ description: 'User token' })
    token: string;
}
