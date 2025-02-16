import { LoggerService } from '@nestjs/common';
import * as fluent from 'fluent-logger';

export class FluentBitLogger implements LoggerService {
  private fluentLogger: fluent.FluentSender<Record<string, unknown>>;

  constructor() {
    this.fluentLogger = fluent.createFluentSender('nest-logs', {
      host: process.env.FLUENTBIT_HOST || 'localhost',
      port: parseInt(process.env.FLUENTBIT_PORT, 10) || 24224,
      timeout: 3.0,
      reconnectInterval: 60*1000, // 1 minutes
    });
  }

  log(message: string, context?: string) {
    this.sendLog('log', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.sendLog('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.sendLog('warn', message, context);
  }

  debug(message: string, context?: string) {
    this.sendLog('debug', message, context);
  }

  verbose(message: string, context?: string) {
    this.sendLog('verbose', message, context);
  }

  private sendLog(level: string, message: string, context?: string, trace?: string) {
    this.fluentLogger.emit(level, {
      level,
      message,
      context,
      trace,
      timestamp: new Date().toISOString(),
    });
  }
}
