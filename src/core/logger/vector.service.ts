import { Inject, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

export class VectorLogger implements LoggerService {
  private vectorHost: string;
  private vectorPort: number;
  private client: net.Socket;
  private isConnected = false;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.vectorHost = this.configService.get<string>('VECTOR_HOST'),// || '127.0.0.1';
    this.vectorPort = Number(this.configService.get<string>('VECTOR_PORT')),// || 9000;

    this.client = new net.Socket();
    this.connectToVector();
  }

  private connectToVector() {
    this.client.connect(this.vectorPort, this.vectorHost, () => {
      this.isConnected = true;
      console.log(`✅ Connected to Vector at ${this.vectorHost}:${this.vectorPort}`);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      console.error('Vector logging error:', err);
      setTimeout(() => this.connectToVector(), 5000); // Attempt to reconnect after 5 seconds
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.warn('Vector connection closed. Reconnecting...');
      setTimeout(() => this.connectToVector(), 5000);
    });
  }

  private sendLog(level: string, message: string, context?: string | object, trace?: string) {
    if (!this.isConnected) {
      console.warn('VectorLogger: Not connected. Log entry skipped.');
      return;
    }

    const flattenedContext = context
      ? typeof context === 'object'
        ? context
        : { context }
      : {};
        
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...flattenedContext,
      trace: trace || undefined,
    };

    try {
      const logString = JSON.stringify(logEntry) + '\n';
      this.client.write(logString);
    } catch (err) {
      console.error('Error serializing log:', err);
    }
  }

  log(message: string, context?: string | object) {
    this.sendLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string | object) {
    this.sendLog('error', message, context, trace);
  }

  warn(message: string, context?: string | object) {
    this.sendLog('warn', message, context);
  }

  debug(message: string, context?: string | object) {
    this.sendLog('debug', message, context);
  }

  verbose(message: string, context?: string | object) {
    this.sendLog('verbose', message, context);
  }
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

