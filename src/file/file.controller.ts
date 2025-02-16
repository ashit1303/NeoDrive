import { BadRequestException, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express } from 'express';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandardErrorResponse } from '../core/http-exception.filter';


@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully', /* type: SuccessResponse<{ filename: string }> */ })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation errors or file upload failed', type: StandardErrorResponse })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf|xlsx)$/ }), // Example: Allow only image files
      ],
    }),
  ) file: Express.Multer.File) {
    
    try {
      return this.fileService.uploadFile(file);
    } catch (error) {
        console.error("error in file upload", error);
        throw new BadRequestException("File upload failed");
    }
  }
}