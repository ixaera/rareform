import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';

interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ user: User }>('/api/auth/register', { username, email, password }, { withCredentials: true })
      .pipe(
        tap(res => this.currentUser.set(res.user)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<{ user: User }>('/api/auth/login', { username, password }, { withCredentials: true })
      .pipe(
        tap(res => this.currentUser.set(res.user)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>('/api/auth/logout', {}, { withCredentials: true })
      .pipe(tap(() => this.currentUser.set(null)));
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http
      .get<{ user: User }>('/api/auth/me', { withCredentials: true })
      .pipe(
        tap(res => this.currentUser.set(res.user)),
        map(() => true),
        catchError(() => {
          this.currentUser.set(null);
          return of(false);
        })
      );
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
