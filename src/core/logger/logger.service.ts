import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

export class VectorLogger implements LoggerService {
  private vectorHost: string;
  private vectorPort: number;

  constructor(private readonly configService: ConfigService) {
    this.vectorHost = this.configService.get<string>('VECTOR_HOST') || '127.0.0.1';
    this.vectorPort = parseInt(this.configService.get<string>('VECTOR_PORT'), 10) || 9000;
  }

  log(message: string, context?: string) {
    this.sendLog('info', message, context);
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
    const client = new net.Socket();
    client.connect(this.vectorPort, this.vectorHost, () => {
      const logEntry = JSON.stringify({
        level,
        message,
        context,
        trace,
        timestamp: new Date().toISOString()
      }) + '\n';
      
      client.write(logEntry);
      client.end();
    });

    client.on('error', (err) => {
      console.error('Vector logging error:', err);
    });
  }

//   import axios from 'axios';
// [sources.http_logs]
// type = "http_server"
// address = "0.0.0.0:9001"
// async function sendLogToVector(level: string, message: string) {
//     await axios.post('http://127.0.0.1:9001', {
//         level,
//         message,
//         timestamp: new Date().toISOString(),
//     });
// }

// sendLogToVector('error', 'Something went wrong in NestJS!');
}
