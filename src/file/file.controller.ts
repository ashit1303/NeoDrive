import { Controller, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express, Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StandardErrorResponse } from '../core/http-exception.filter';
import { SonicService } from 'src/core/sonic/sonic.service';
import { FileUploadDto } from './dto';
import { ShortCodeDTO } from 'src/shortener/dto';
import * as fs from 'fs';
import * as mime from 'mime-types';


@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService, private readonly search: SonicService) {}

  @Post('upload')
  @ApiOperation({ summary: 'File Upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', })
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
    
  let data = this.fileService.uploadFileAndSave(file);
  return data
  }

  @Post('upload-secret')
  @ApiOperation({ summary: 'File Upload' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'shortCode', example: 'aaa-aaa-aaa' })
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation errors or file upload failed', type: StandardErrorResponse })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileSecret(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|pdf|xlsx)$/ }), // Example: Allow only image files
      ],
    }),
  ) file: Express.Multer.File, @Query('shortCode') shortCode: string) {
    // const shortCode = Helper.generateShortCode();
    let data = this.fileService.uploadFileAndSaveSecret(shortCode,file);
    return data
  }

  @Get('/f/:shortValue')
  @ApiParam({ name: 'shortValue', example: 'aaa-aaa-aaa' })
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 200, description: 'Redirecting to original URL', type: ShortCodeDTO}, )
  async downloadFile(
    @Param('shortValue') shortValue: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fileData = await this.fileService.fetchFile(shortValue);

    if (!fileData || !fileData.data) {
      throw new NotFoundException('File not found'); // Use NotFoundException
    }

    const file = fileData.data;
    const filePath = file.filePath; // Get the file path from your data
    const fileName = file.fileName; // Get the file name

    if (!filePath || !fileName) {
      throw new NotFoundException('File path or name not found');
    }

    const mimeType = mime.lookup(file.fileName); // Get MIME type from original filename

    try {
        const fileContent = fs.readFileSync(filePath);
        const stream = new StreamableFile(fileContent);

        res.setHeader('Content-Type', mimeType.toString());
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        return stream;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new NotFoundException('File not found on disk');
        }
        throw new Error('Error reading file from disk'); // Or a more specific exception
    }
  }



  @Post('search')
  async searchFile(@Query('q') file: string) {
    return this.fileService.searchFile(file);
  }
}