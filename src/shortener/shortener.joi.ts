// import { ApiProperty } from '@nestjs/swagger';
// import { url } from 'inspector';
// import * as Joi from 'joi';
// import { BaseResponse } from 'src/core/response.interceptor';

// export const shortCodeJoi = Joi.object({
//   shortCode: Joi.string().length(11).regex(/^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/).description('Short value').example('aaa-aaa-aaa'),
//   url: Joi.string().uri().description('Complete URL').example('https://www.google.com'),
// });

// export const pageDto = Joi.object({
//     page: Joi.number().integer().min(1).required(),
//     pageSize: Joi.number().integer().min(1).max(100).required(),
// });
