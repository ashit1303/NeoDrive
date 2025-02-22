import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { log } from 'console';
import { HttpExceptionFilter } from './core/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './core/response.interceptor';
import {parse,stringify} from 'json-bigint';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
// DANGEROUSLY override JSON prototype methods to handle big ints.
  JSON.parse = parse;
  JSON.stringify = stringify;
  // validation
  app.useGlobalPipes(new ValidationPipe());
  // cors
  app.enableCors();
  // Response restructure while sending res from API 
  app.useGlobalInterceptors(new ResponseInterceptor());
  // Error standor structure while sending errors from API
  app.useGlobalFilters(new HttpExceptionFilter());
  // log('printing env', configService.get('ENV'));
  if(configService.get('ENV') === 'main'){
    log('Swagger is enabled');
    const swagConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token',
    })
    .addSecurityRequirements('bearer')  
    .build();
    const document = SwaggerModule.createDocument(app, swagConfig);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(configService.get('PORT') ?? 3000);
  log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

