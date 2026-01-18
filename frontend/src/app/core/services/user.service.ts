import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "OPERADOR";
  active?: boolean;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // ============ MY PROFILE METHODS ============

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateMyProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, user);
  }

  changeMyPassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me/password`, request);
  }

  // ============ ADMIN METHODS ============

  findAll(page = 0, size = 20, search?: string): Observable<Page<User>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    if (search) params = params.set("search", search);
    return this.http.get<Page<User>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/password`, { password });
  }
}
