import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, LoginDTO, RegisterDTO } from '../models/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private httpClient: HttpClient) { }

  login(dto: LoginDTO): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/login`, dto);
  }
  register(dto: RegisterDTO): Observable<string> {
    return this.httpClient.post(`${this.apiUrl}/register`, dto, { responseType: 'text' });
  }
  sauvegarderToken(token: AuthResponse): void {
    localStorage.setItem('token', token.token);
    localStorage.setItem('username', token.username);
    localStorage.setItem('role', token.role);
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  estConnecte(): boolean {
    return this.getToken() !== null;
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
}
