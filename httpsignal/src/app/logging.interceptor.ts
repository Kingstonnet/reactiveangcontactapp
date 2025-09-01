import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
    console.log('Handling Request....', req.url, req.method)
    return next(req).pipe(
        tap((event) => {
            if (event.type === HttpEventType.Response) {
                console.log('Response received: ', event.status, event.body)
            }
        })
    )
}
