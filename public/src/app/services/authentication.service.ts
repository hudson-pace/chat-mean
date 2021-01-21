import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<User>;
    private accessToken: BehaviorSubject<string>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(null);
        this.accessToken = new BehaviorSubject<string>(null);
    }

    public getUserSubject(): BehaviorSubject<User> {
        return this.userSubject;
    }
    public getAccessToken(): BehaviorSubject<string> {
        return this.accessToken;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.authUrl}/login`, { username, password }, { withCredentials: true })
        .pipe(map(result => {
            this.accessToken.next(result.accessToken);
            this.startRefreshTokenTimer();
            this.http.get<any>(`${environment.apiUrl}/users/user`, { withCredentials: true })
            .subscribe(user => {
                this.userSubject.next(user);
            });
        }));
    }

    register(username: string, password: string) {
        return this.http.post<any>(`${environment.authUrl}/register`, { username, password }, { withCredentials: true })
            .pipe(map(result => {
                this.accessToken.next(result.accessToken);
                this.startRefreshTokenTimer();
                this.http.get<any>(`${environment.apiUrl}/users/user`, { withCredentials: true })
                    .subscribe(user => {
                        this.userSubject.next(user);
                    });
            }));
    }

    logout() {
        this.http.post<any>(`${environment.authUrl}/revoke-token`, {}, { withCredentials: true }).subscribe(res => {
        }, err => {
            console.log(err.error);
        });
        this.stopRefreshTokenTimer();
        this.userSubject.next(null);
        this.accessToken.next(null);
        this.router.navigate(['/']);
    }

    refreshToken() {
        return this.http.post<any>(`${environment.authUrl}/renew-tokens`, {}, { withCredentials: true })
            .subscribe(result => {
                this.accessToken.next(result.accessToken);
                if (!this.userSubject.value) {
                    this.http.get<any>(`${environment.apiUrl}/users/user`, { withCredentials: true })
                        .subscribe(user => {
                            this.userSubject.next(user);
                            this.startRefreshTokenTimer();
                        }, err => {
                            this.userSubject.next(null);
                        });
                    }
            }, err => {
                this.userSubject.next(null);
            });
    }

    getUser(username: string) {
        return this.http.get<any>(`${environment.apiUrl}/users/user/${username}`);
    }

    getUserPosts(username: string) {
        return this.http.get<any>(`${environment.apiUrl}/users/user/${username}/posts`);
    }

    updateUser(username: string, updateParams) {
        return this.http.put<any>(`${environment.apiUrl}/users/user/${username}`, updateParams, { withCredentials: true });
    }

    getAllUsers() {
        return this.http.get<any>(`${environment.apiUrl}/users`, { withCredentials: true });
    }
    
    deleteUser(username: string) {
        return this.http.delete<any>(`${environment.apiUrl}/users/user/${username}`);
    }


    // helper methods

    private refreshTokenTimeout;

    private startRefreshTokenTimer() {
        let accessToken = JSON.parse(atob(this.accessToken.value.split('.')[1]));
        let expires = new Date(accessToken.exp * 1000);
        let timeout = expires.getTime() - Date.now() - (60 * 1000); // one minute before token expires
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}