import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";
import { Page } from "@shared/types/Page";

export { Page };

export interface Category {
  id?: number;
  name: string;
  description?: string;
  active?: boolean;
  totalProducts?: number;
  createdAt?: string;
}

@Injectable({ providedIn: "root" })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  findAll(
    page = 0,
    size = 20,
    search?: string,
    active?: boolean | null,
  ): Observable<Page<Category>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    if (search) params = params.set("search", search);
    if (active !== null && active !== undefined)
      params = params.set("active", active.toString());
    return this.http.get<Page<Category>>(this.apiUrl, { params });
  }

  findAllActive(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/active`);
  }

  findById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
