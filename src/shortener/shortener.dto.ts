import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const shortCode = Joi.object({
  shortCode: Joi.string().length(11).regex(/^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/).description('Short value').example('aaa-aaa-aaa'),
});

export interface ShortCode { // For type safety
  shortCode?:string;
}

export class LoginRes {
    @ApiProperty({ description: 'Complete URL' })
    url: string;
}