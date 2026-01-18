import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";
import { Page } from "./client.service";

export interface Vehicle {
  id?: number;
  clientId: number;
  clientName?: string;
  licensePlate: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
  currentMileage?: number;
  notes?: string;
  active?: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: "root" })
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;
  constructor(private http: HttpClient) {}

  findAll(
    page = 0,
    size = 20,
    search?: string,
    active?: boolean | null,
  ): Observable<Page<Vehicle>> {
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

    return this.http.get<Page<Vehicle>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }
  findByLicensePlate(licensePlate: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(
      `${this.apiUrl}/license-plate/${licensePlate}`,
    );
  }
  findByClient(clientId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/client/${clientId}`);
  }
  create(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }
  update(id: number, vehicle: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  toggleStatus(id: number): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getActiveVehicles(): Observable<Number> {
    return this.http.get<Number>(`${this.apiUrl}/count`);
  }
}
