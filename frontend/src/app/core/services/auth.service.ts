import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { environment } from "@env/environment";

export type UserRole = "ADMIN" | "OPERADOR";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  expiresIn: number;
  user: User;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "dvmotos_token";
  private readonly REFRESH_TOKEN_KEY = "dvmotos_refresh_token";
  private readonly USER_KEY = "dvmotos_user";
  private currentUserSignal = signal<User | null>(this.getStoredUser());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(
    () => !!this.currentUserSignal() && !!this.getToken(),
  );
  isAdmin = computed(() => this.currentUserSignal()?.role === "ADMIN");

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(["/login"]);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/refresh?refreshToken=${refreshToken}`,
        {},
      )
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
