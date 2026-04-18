import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { forkJoin } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { ClientService } from "@core/services/client.service";
import { VehicleService } from "@core/services/vehicle.service";
import { ProductService, Product } from "@core/services/product.service";
import { ServiceOrderService } from "@core/services/service-order.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private clientService = inject(ClientService);
  private vehicleService = inject(VehicleService);
  private productService = inject(ProductService);
  private serviceOrderService = inject(ServiceOrderService);

  // Stats (só carregam para ADMIN — ver ngOnInit)
  countClients = signal<number | null>(null);
  countVehicles = signal<number | null>(null);
  countPendingOrders = signal<number | null>(null);
  countLowStock = signal<number | null>(null);

  // Lista de produtos com estoque baixo
  lowStockProducts = signal<Product[]>([]);
  loadingLowStock = signal(false);

  isAdmin = computed(() => this.authService.currentUser()?.role === "ADMIN");

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadStats();
      this.loadLowStockProducts();
    }
  }

  private loadStats(): void {
    // Clientes e veículos ativos (endpoints já existentes).
    this.clientService
      .getActiveClients()
      .subscribe((n) => this.countClients.set(Number(n)));

    this.vehicleService
      .getActiveVehicles()
      .subscribe((n) => this.countVehicles.set(Number(n)));

    // Produtos com estoque baixo.
    this.productService
      .countLowStock()
      .subscribe((res) => this.countLowStock.set(res.count));

    // OS pendentes = soma dos 3 status em aberto.
    forkJoin({
      open: this.serviceOrderService.countByStatus("OPEN"),
      inProgress: this.serviceOrderService.countByStatus("IN_PROGRESS"),
      waitingParts: this.serviceOrderService.countByStatus("WAITING_PARTS"),
    }).subscribe(({ open, inProgress, waitingParts }) => {
      this.countPendingOrders.set(
        open.count + inProgress.count + waitingParts.count,
      );
    });
  }

  private loadLowStockProducts(): void {
    this.loadingLowStock.set(true);
    this.productService.findLowStock().subscribe({
      next: (products) => {
        this.lowStockProducts.set(products);
        this.loadingLowStock.set(false);
      },
      error: () => this.loadingLowStock.set(false),
    });
  }
}
