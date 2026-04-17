import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";
import { Page } from "@shared/types/Page";

export { Page };

export interface Client {
  id?: number;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  active?: boolean;
  createdAt?: string;
  totalVehicles?: number;
}

@Injectable({ providedIn: "root" })
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;
  constructor(private http: HttpClient) {}

  findAll(
    page = 0,
    size = 20,
    search?: string,
    active?: boolean | null,
  ): Observable<Page<Client>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (search) {
      params = params.set("search", search);
    }

    // 2. Adicione a lógica para enviar o status apenas se não for nulo (Todos)
    if (active !== null && active !== undefined) {
      params = params.set("active", active.toString());
    }

    return this.http.get<Page<Client>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }
  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }
  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  activate(id: number): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/activate`, {});
  }
  toggleStatus(id: number): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getActiveClients(): Observable<Number> {
    return this.http.get<Number>(`${this.apiUrl}/count`);
  }
}
