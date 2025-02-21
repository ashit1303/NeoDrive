import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { log } from 'console';
import { HttpExceptionFilter } from './core/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './core/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  log('printing env', configService.get('ENV'));
  if(configService.get('ENV') === 'main'){
    log('Swagger is enabled');
    const swagConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
    const document = SwaggerModule.createDocument(app, swagConfig);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(configService.get('PORT') ?? 3000);
  log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

