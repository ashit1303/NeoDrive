import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { VectorLogger } from './vector.service';
import { ZincLogger } from './zinc.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    // private readonly vector: VectorLogger,
    private readonly zinc: ZincLogger
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Handle response finish
    res.on('finish', () => {
      // Skip health check logs
      const userAgent = req.get('user-agent') || '';
      if (userAgent.match(/HealthChecker/)) {
        return;
      }

      this.zinc.log('HTTP Request', {
        status: res.statusCode,
        method: req.method,
        url: req.originalUrl,
        contentLength: res.get('content-length'),
        responseTime: `${Date.now() - startTime}ms`,
        remoteAddress: req.ip,
        userAgent: userAgent
      });
      // this.vector.log('HTTP Request', {
      //   status: res.statusCode,
      //   method: req.method,
      //   url: req.originalUrl,
      //   contentLength: res.get('content-length'),
      //   responseTime: `${Date.now() - startTime}ms`,
      //   remoteAddress: req.ip,
      //   userAgent: userAgent
      // });
    });

    next();
  }
}