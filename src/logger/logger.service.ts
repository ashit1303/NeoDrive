import { Injectable } from '@nestjs/common';
import * as fluent from 'fluent-logger';

@Injectable()
export class LoggerService {
  private logger = fluent.createFluentSender('file-server', {
    host: 'localhost',
    port: 24224,
    timeout: 3.0,
  });

  log(message: string, data: any) {
    this.logger.emit('log', { message, ...data });
  }
}