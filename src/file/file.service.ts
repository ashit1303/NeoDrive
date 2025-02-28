import { Injectable, Query } from '@nestjs/common';
// import { PrismaService } from '../core/prisma/prisma.service';
import * as fs from 'fs';
import { HelperAndFormatter as Helper } from 'src/core/helper';


import { SonicService } from 'src/core/sonic/sonic.service';
import { ShortCodeDTO } from 'src/shortener/dto';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { Users } from 'src/core/models/Users';
import { Files } from 'src/core/models/Files';


@Injectable()
export class FileService {
  constructor(
    // private prisma: PrismaService, 
    private sonicService: SonicService,
    private typeorm: TypeormService,
  ) {}
  
  
  async uploadFileAndSave(file: Express.Multer.File, ) {
    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
    // convert size in bytes 
    // store in bytes
    const shaHash = Helper.generateSHA(filePath);
    const shortCode = Helper.generateShortCode()

    // Check for duplicate files
    // const existingFile = await this.prisma.files.findUnique({ where: { file_sha:shaHash } });
    const existingFile = await this.typeorm.getRepository(Files).findOne({ where: { fileSha:shaHash } });
    // create short code and save 
    if (existingFile) {
      fs.unlinkSync(filePath); // Delete duplicate file
      throw new Error('Duplicate file detected');
    }

    // Save file metadata to database
    const newFile = this.typeorm.getRepository(Files).save({
      fileName: fileName,
      fileSha: shaHash,
      filePath: filePath,
      fileSize: fileSize.toString(),
      shortCode: shortCode.shortCode
    })
    

    return { success:true, message: 'File uploaded successfully', data: shaHash };
  }

  async uploadFileAndSaveSecret(shortCode: string  ,file: Express.Multer.File) {
    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
    // convert size in bytes 
    // store in bytes
    const shaHash = Helper.generateSHA(filePath);

    // Check for duplicate files
    const existingFile = await this.typeorm.getRepository(Files).findOne({ where: { fileSha:shaHash } });
    // create short code and save 
    if (existingFile) {
      fs.unlinkSync(filePath); // Delete duplicate file
      throw new Error('Duplicate file detected');
    }
    // Save file metadata to database
    const newFile = await this.typeorm.getRepository(Files).save({
      fileName: fileName,
      fileSha: shaHash,
      filePath: filePath,
      fileSize: fileSize.toString(),
      shortCode: shortCode
    });

    return { success:true, message: 'File uploaded successfully', data: shaHash };
  }
  
  
  async searchFile(query: string) {
    let resp = await this.sonicService.search('files', 'default', query);
    return { success:true, message: 'File uploaded successfully', data: resp };
  }
  async fetchFile(shortValue: string) {
    try {
      const resp = await this.typeorm.getRepository(Files).findOne({ where: { shortCode: shortValue } });
      return { success: true, message: 'File fetched successfully', data: resp };
    } catch (error) {
      return { success: false, message: 'Error fetching file', data: null }; // Handle errors
    }
  }

}