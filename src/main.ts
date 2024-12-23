import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('API Documents')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .setDescription('Amor Agency API document')
    .setVersion('1.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix(configService.get('API_VERSION', '')).useGlobalPipes(new ValidationPipe());


  const port = configService.get('APP_PORT', 3333);
  const host = configService.get('APP_HOST', '127.0.0.1');

  await app.listen(port);
      
  Logger.log(`Server is running on: http://${host}:${port}`, 'Bootstrap');
  Logger.log(`API docs on: http://${host}:${port}/api`, 'API Docs');
}
bootstrap();
