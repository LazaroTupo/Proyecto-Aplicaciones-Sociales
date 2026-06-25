import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      // 'http://localhost:3000',
      // 'http://localhost:3001',
      'http://213.210.20.7:3003',
      'http://213.210.20.7:3004',
    ],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.listen(
    process.env.PORT ?? 3001,
  );
}

bootstrap();