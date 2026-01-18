import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiResponseFormatter } from '@utils/models/api-response';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const message =
      exception.message ?? 'El tiempo ha caducado. Intentalo nuevamente';
    const status = 401;

    response
      .status(status)
      .json(ApiResponseFormatter.error(undefined, message, status));
  }
}
