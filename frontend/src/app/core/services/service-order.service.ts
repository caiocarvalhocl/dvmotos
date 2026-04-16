import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Page } from './client.service';

export type ServiceOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'CANCELLED';
export type ServiceOrderItemType = 'SERVICE' | 'PART';

export interface ServiceOrderItem {
  id?: number;
  type: ServiceOrderItemType;
  productId?: number;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface ServiceOrder {
  id?: number;
  clientId: number;
  clientName?: string;
  vehicleId: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  userId?: number;
  userName?: string;
  status?: ServiceOrderStatus;
  entryMileage?: number;
  servicesAmount?: number;
  partsAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
  items?: ServiceOrderItem[];
}

export interface ServiceOrderRequest {
  clientId: number;
  vehicleId: number;
  entryMileage?: number;
  notes?: string;
  discountAmount?: number;
  items?: ServiceOrderItem[];
}

@Injectable({ providedIn: 'root' })
export class ServiceOrderService {
  private apiUrl = `${environment.apiUrl}/service-orders`;

  constructor(private http: HttpClient) {}

  findAll(page = 0, size = 20, search?: string, status?: ServiceOrderStatus | null): Observable<Page<ServiceOrder>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<Page<ServiceOrder>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<ServiceOrder> {
    return this.http.get<ServiceOrder>(`${this.apiUrl}/${id}`);
  }

  findByVehicle(vehicleId: number, page = 0, size = 20): Observable<Page<ServiceOrder>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<ServiceOrder>>(`${this.apiUrl}/vehicle/${vehicleId}`, { params });
  }

  create(request: ServiceOrderRequest): Observable<ServiceOrder> {
    return this.http.post<ServiceOrder>(this.apiUrl, request);
  }

  update(id: number, request: ServiceOrderRequest): Observable<ServiceOrder> {
    return this.http.put<ServiceOrder>(`${this.apiUrl}/${id}`, request);
  }

  addItem(osId: number, item: ServiceOrderItem): Observable<ServiceOrder> {
    return this.http.post<ServiceOrder>(`${this.apiUrl}/${osId}/items`, item);
  }

  removeItem(osId: number, itemId: number): Observable<ServiceOrder> {
    return this.http.delete<ServiceOrder>(`${this.apiUrl}/${osId}/items/${itemId}`);
  }

  changeStatus(id: number, status: ServiceOrderStatus): Observable<ServiceOrder> {
    return this.http.patch<ServiceOrder>(`${this.apiUrl}/${id}/status`, { status });
  }

  countByStatus(status: ServiceOrderStatus): Observable<{ count: number }> {
    const params = new HttpParams().set('status', status);
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`, { params });
  }
}
