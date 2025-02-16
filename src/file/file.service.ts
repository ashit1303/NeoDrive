import { Injectable, Query } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { SonicService } from 'src/core/sonic/sonic.service';


@Injectable()
export class FileService {
  constructor(private prisma: PrismaService, private sonicService: SonicService) {}
  
  private async generateSHA(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }
  async uploadFile(file: Express.Multer.File) {
    const filePath = file.path;
    const name = file.originalname;
    const size = file.size;
    // convert size in bytes 
    // store in bytes
    const shaHash = await this.generateSHA(filePath);

    // Check for duplicate files
    const existingFile = await this.prisma.files.findUnique({ where: { sha:shaHash } });
    if (existingFile) {
      fs.unlinkSync(filePath); // Delete duplicate file
      throw new Error('Duplicate file detected');
    }

    // Save file metadata to database
    const newFile = await this.prisma.files.create({
      data: { name, sha: shaHash,  filePath, size },
    });

    return { success:true, message: 'File uploaded successfully', data: shaHash };
  }
  
  async searchFile(@Query('q') query: string) {
    let resp = await this.sonicService.search('files', 'default', query);
    return { success:true, message: 'File uploaded successfully', data: resp };
  }

}