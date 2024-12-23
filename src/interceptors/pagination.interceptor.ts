import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPagination } from './interfaces';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map(({ content: { items, total, page, perPage, totalPage } }: IPagination) => {
        return {
          content: {
            items,
            total,
            page,
            perPage,
            totalPage,
          },
        };
      }),
    );
  }
}
