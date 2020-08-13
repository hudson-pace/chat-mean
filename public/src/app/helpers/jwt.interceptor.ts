import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // if request is to api and there is an access token, add it to the auth header
        let accessToken = this.authenticationService.getAccessToken().value;
            if (accessToken && request.url.startsWith(environment.apiUrl)) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${accessToken}` }
            });
        }
        return next.handle(request);
    }
}