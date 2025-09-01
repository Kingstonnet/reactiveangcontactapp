import { HttpContextToken, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { map, tap } from 'rxjs';

export const SKIP_AUTH = new HttpContextToken(() => '');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.context.get(SKIP_AUTH)) {
        return next(req);
    }

    console.log('Entering Auth...')

    const token = localStorage.getItem('token') || 'dummy-token';

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    })

    return next(authReq).pipe(
        tap(event => {
            if(event.type === HttpEventType.Response) {
                console.log('Auth response received');
            }
        })
    )
}
