import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, Min, MinLength } from 'class-validator';
import * as Joi from 'joi';
import { BaseResponse } from '../response.interceptor';

// export const loginReq = Joi.object({
//     email: Joi.string().email().description('User email').example('exp@any.com'),
//     password: Joi.string().required().description('User password').example('pass')
// }).or('email', 'mobile');

export class LoginReqDTO { // For type safety
    @ApiProperty({ description: 'Email'})
    @IsEmail()
    @Matches(/@(?:gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|aol\.com|msn\.com)$/, { message: 'Only popular email domains are allowed (e.g., @gmail.com, @yahoo.com)' }) // Custom regex for popular domains
    email:string;

    @ApiProperty({description: 'Pass'})
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, { message: 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' }) // Example regex
    @MinLength(6)
    password: string;
}

export class TokenDTO {
    @ApiProperty({ description: 'User token' })
    token: string;
}

export class LoginResDTO extends BaseResponse<TokenDTO>{
    @ApiProperty({ description: 'Payload', type: 'object', properties: { token: { type: 'string', example: 'xxxxxxx' }}})
    data: {token:string}
}


export class RegisterResDTO extends BaseResponse<object>{
    @ApiProperty({ description: 'Payload', type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type : 'string', example :'User registered successfully'}}})
    data: {success: boolean, message : string}
}

export class authPayloadDTO{
    id : string;
    username:string;
    email:string;
    
}

// export class ChangePasswordReqDto {
//     @IsNotEmpty({ message: 'Old password is required' })
//     @IsString({ message: 'Old password must be a string' })
//     oldPassword!: string;
  
//     @IsNotEmpty({ message: 'New password is required' })
//     @IsString({ message: 'New password must be a string' })
//     @MinLength(6, { message: 'New password must be at least 6 characters' }) // Changed to 6
//     @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, { message: 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' }) // Example regex
//     newPassword!: string;
  
//     @IsNotEmpty({ message: 'Confirm password is required' })
//     @IsString({ message: 'Confirm password must be a string' })
//     confirmPassword!: string;
  
//     // ... other properties
//   }