import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponseFormatter } from '@utils/models/api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Ha ocurrido un error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse() as any;

      if (typeof res === 'string') {
        message = res;
      } else {
        message = res.message ?? exception.message;
        errors = res.errors ?? res.data ?? undefined;
      }
    } // 🔹 Si es Error nativo de JS
    else if (exception instanceof Error) {
      message = exception.message;
      errors = exception;
    }
    // 🔹 Si es un string simple
    else if (typeof exception === 'string') {
      message = exception;
    }

    response
      .status(status)
      .json(ApiResponseFormatter.error(errors, message, status));
  }
}
