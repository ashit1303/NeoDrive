import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../core/prisma/prisma.service';

@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [FileController],
  providers: [FileService, PrismaService],
})
export class FileModule {}