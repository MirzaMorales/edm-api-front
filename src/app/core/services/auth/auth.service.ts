import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginCredentials } from '../../models/auth.model';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('at', res.access_token);
        localStorage.setItem('rt', res.refresh_token);
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  // Este método coincide con tu @Post("logout") en NestJS
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      finalize(() => {
        // Limpiamos los tokens locales pase lo que pase con la petición al servidor
        localStorage.clear();
      })
    );
  }

  getAccessToken() { 
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('at'); 
    }
    return null;
  }
}