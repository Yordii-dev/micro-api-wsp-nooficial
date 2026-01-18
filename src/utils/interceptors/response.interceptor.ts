import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseFormatter } from '../models/api-response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If it already use ApiResponseFormatter, not apply mapping
        if (data && typeof data === 'object' && 'success' in data) {
          console.log(data);

          return data; //return beacuse it already used ApiResponseFormatter
        }
        return ApiResponseFormatter.success(data);
      }),
    );
  }
}
