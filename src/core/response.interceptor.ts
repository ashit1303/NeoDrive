// src/common/interceptors/response.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
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