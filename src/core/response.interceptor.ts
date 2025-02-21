// src/common/interceptors/response.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class BaseResponse<T> {
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;
  @ApiProperty({ description: 'Request status' })
  success: boolean;
  @ApiProperty({ description: 'Response message' })
  message: string;
  @ApiProperty({ description: 'Payload'})
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      
      map((data) => {
        if (response.headersSent) {  // Key change: Check headersSent
          return data; // Or return nothing, depending on your preference.
        }

        if (data === null || data === undefined) {
          return data;
        }

        //Check for streamable file
        if (data instanceof StreamableFile || data instanceof Buffer || typeof data === 'string'){
            return data
        }
        const baseResponse: BaseResponse<T> = {
          statusCode: response.statusCode,
          success: true,
          message: data.message || 'Request was successful',
          data,
        };
        delete data.message;
        baseResponse.data = data;
        return baseResponse;
      }),
    );
  }
}
// import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class ResponseModifierMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     const originalSend = res.send; // Store original res.send

//     res.send = function (body?: any): Response {
//       if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === 'object' && body !== null && !(body instanceof StreamableFile) && !(body instanceof Buffer) && typeof body !== 'string') {
//         const baseResponse = {
//           statusCode: res.statusCode,
//           success: true,
//           message: body.message || 'Request was successful',
//           data: { ...body },
//         };
//         //delete baseResponse.data.message;
//         return originalSend.call(this, baseResponse); // Call original res.send
//       }
//         if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === 'string'){
//             const baseResponse = {
//                 statusCode: res.statusCode,
//                 success: true,
//                 message: 'Request was successful',
//                 data: body
//             }
//             return originalSend.call(this, baseResponse)
//         }
//       return originalSend.apply(this, arguments); // Call original res.send for other cases
//     };

//     next();
//   }
// }