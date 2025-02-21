import { Module } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';
// import { ZincLogger } from 'src/core/logger/zinc.service';
import { LoggerModule } from 'src/core/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [ShortenerService],
  controllers: [ShortenerController]
})
export class ShortenerModule {}
