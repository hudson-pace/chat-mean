import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(null);
    }

    public getUserSubject(): BehaviorSubject<User> {
        return this.userSubject;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/authenticate`, { username, password }, { withCredentials: true })
            .pipe(map(user => {
                this.userSubject.next(user);
                this.startRefreshTokenTimer();
                return user;
            }));
    }

    register(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/users/register`, { user: { username, password } }, { withCredentials: true })
            .pipe(map(user => {
                this.userSubject.next(user);
                this.startRefreshTokenTimer();
                return user;
            }));
    }

    logout() {
        this.http.post<any>(`${environment.apiUrl}/users/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    refreshToken() {
        return this.http.post<any>(`${environment.apiUrl}/users/refresh-token`, {}, { withCredentials: true })
            .pipe(map((user) => {
                this.userSubject.next(user);
                this.startRefreshTokenTimer();
                return user;
            }));
    }

    getUser(username: string) {
        return this.http.get<any>(`${environment.apiUrl}/users/user/${username}`);
    }

    getUserPosts(username: string) {
        return this.http.get<any>(`${environment.apiUrl}/users/user/${username}/posts`);
    }


    // helper methods

    private refreshTokenTimeout;

    private startRefreshTokenTimer() {
        var jwtToken = JSON.parse(atob(this.userSubject.value.jwtToken.split('.')[1])); // get json object from encoded jwt.
        var expires = new Date(jwtToken.exp * 1000);
        var timeout = expires.getTime() - Date.now() - (60 * 1000); // one minute before token expires
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}