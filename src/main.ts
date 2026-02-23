import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtExceptionFilter } from '@utils/exceptions/Jwt-exception';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createCorsConfig } from 'cors.config';
import { dtoExceptions } from '@utils/exceptions/dto-exception';
import { GlobalExceptionFilter } from '@utils/exceptions/global-exception';
import { ResponseInterceptor } from '@utils/interceptors/response.interceptor';
import { PREFIX_API } from '@utils/globals/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix(PREFIX_API);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') ?? 4001;
  const hostname = configService.get<string>('HOSTNAME');
  const front_domain = configService.get<string>('FRONT_DOMAIN');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true /* 👈 hace que propiedades no declaradas sean rechazadas en validaciones Prima DTOs*/,
      exceptionFactory: dtoExceptions,
    }),
  );
  // app.enableCors(corsConfig);
  app.enableCors(createCorsConfig(configService));
  app.useGlobalFilters(new JwtExceptionFilter(), new GlobalExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on ${hostname}:${port}`);
  });
}
bootstrap();
