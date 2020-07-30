import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        var user = this.authenticationService.getUserSubject().value;
        if (user) {
            return true; // user is logged in
        }
        else
        {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // redirect to login with return url
            return false;
        }
    }
}