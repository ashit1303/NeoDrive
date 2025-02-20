import { Module } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';

@Module({
  providers: [ShortenerService],
  controllers: [ShortenerController]
})
export class ShortenerModule {}
