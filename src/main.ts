import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RawBody, ValidationPipe } from '@nestjs/common';
import { env } from 'process';
import { envs } from './config';

async function bootstrap() {
const logger = new  Logger('Payment-ms')

  const app = await NestFactory.create(AppModule, {rawBody: true});
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
    );
  await app.listen(process.env.PORT ?? 3000);

  logger.log(`Payments Microservice  running on port ${envs.port}`)}
bootstrap();
