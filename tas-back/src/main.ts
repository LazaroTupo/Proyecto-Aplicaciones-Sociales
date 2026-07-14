import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  const isProd = configService.get<string>('NODE_ENV') === 'prod';

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Configuración de CORS
  app.enableCors({
    origin: isProd ? frontendUrl : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Pipe de Validación Global Estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuración de Swagger (Solo habilitado en desarrollo)
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('ImpulsaTec API')
      .setDescription('Documentación de los endpoints del backend de ImpulsaTec.')
      .setVersion('1.0')
      .addBearerAuth() // Soporte para JWT
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
