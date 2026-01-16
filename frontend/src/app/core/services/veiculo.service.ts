import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";
import { Page } from "./cliente.service";

export interface Veiculo {
  id?: number;
  clienteId: number;
  clienteNome?: string;
  placa: string;
  marca: string;
  modelo: string;
  ano?: string;
  cor?: string;
  chassi?: string;
  kmAtual?: number;
  observacoes?: string;
  ativo?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class VeiculoService {
  private apiUrl = `${environment.apiUrl}/veiculos`;

  constructor(private http: HttpClient) {}

  findAll(
    page: number = 0,
    size: number = 20,
    search?: string,
  ): Observable<Page<Veiculo>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (search) {
      params = params.set("search", search);
    }

    return this.http.get<Page<Veiculo>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  findByPlaca(placa: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/placa/${placa}`);
  }

  findByCliente(clienteId: number): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  create(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, veiculo);
  }

  update(id: number, veiculo: Veiculo): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, veiculo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
