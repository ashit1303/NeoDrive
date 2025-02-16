import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
  import { Response } from 'express';
  

  export class StandardErrorResponse {
    @ApiProperty({ example: false })
    success: boolean;
  
    @ApiProperty({ example: 'message' })
    message: string;

    error?: string; // Optional, for more detailed error info

  }
  
  @Catch(HttpException)
  
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const err = exception.getResponse() as any; // Get the exception response object
  
      const errorResponse: StandardErrorResponse = {
        success: false,
        message: err.message || exception.message || 'Internal Server Error', // Prioritize err.message, then exception.message, then default
        error: err.error || undefined, // Include detailed error if available
      };
  
      response.status(status).json(errorResponse);
    }
  }
  