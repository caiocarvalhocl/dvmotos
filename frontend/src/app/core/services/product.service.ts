import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";
import { Page } from "@shared/types/Page";

export { Page };

export interface Product {
  id?: number;
  name: string;
  description?: string;
  barcode?: string;
  categoryId?: number;
  categoryName?: string;
  costPrice?: number;
  salePrice: number;
  stockQuantity: number;
  minimumStock?: number;
  unit?: string;
  active?: boolean;
  lowStock?: boolean;
  createdAt?: string;
}

export interface StockMovement {
  id?: number;
  productId?: number;
  productName?: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  reason?: string;
  userName?: string;
  createdAt?: string;
}

@Injectable({ providedIn: "root" })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAll(
    page = 0,
    size = 20,
    search?: string,
    active?: boolean | null,
  ): Observable<Page<Product>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    if (search) params = params.set("search", search);
    if (active !== null && active !== undefined)
      params = params.set("active", active.toString());
    return this.http.get<Page<Product>>(this.apiUrl, { params });
  }

  findById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  findByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/barcode/${barcode}`);
  }

  findLowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/low-stock`);
  }

  countLowStock(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/low-stock/count`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Stock movements
  addStockMovement(
    productId: number,
    movement: Partial<StockMovement>,
  ): Observable<StockMovement> {
    return this.http.post<StockMovement>(
      `${this.apiUrl}/${productId}/stock`,
      movement,
    );
  }

  getStockHistory(
    productId: number,
    page = 0,
    size = 20,
  ): Observable<Page<StockMovement>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    return this.http.get<Page<StockMovement>>(
      `${this.apiUrl}/${productId}/stock/history`,
      { params },
    );
  }
}
