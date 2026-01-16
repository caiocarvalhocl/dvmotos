import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

export interface Cliente {
  id?: number;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo?: boolean;
  createdAt?: string;
  totalVeiculos?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  findAll(
    page: number = 0,
    size: number = 20,
    search?: string,
  ): Observable<Page<Cliente>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (search) {
      params = params.set("search", search);
    }

    return this.http.get<Page<Cliente>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activate(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}/activate`, {});
  }
}
