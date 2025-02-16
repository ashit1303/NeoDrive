import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { log } from 'console';
import { HttpExceptionFilter } from './core/http-exception.filter';
import { ConfigService } from '@nestjs/config';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new ConfigService()
  // app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  log('Swagger is enabled',config.get('ENV'));
  if(config.get('ENV') === 'dev'){
    const swagConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
    const document = SwaggerModule.createDocument(app, swagConfig);
    SwaggerModule.setup('api', app, document);
  }
  

  await app.listen(process.env.PORT ?? 3000);
  log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

