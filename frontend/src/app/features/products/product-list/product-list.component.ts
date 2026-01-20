import { Component, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  ProductService,
  Product,
  Page,
} from "../../../core/services/product.service";
import { debounceTime, Subject } from "rxjs";
import { Severity } from "@shared/types/Severity";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    CurrencyPipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  lowStockCount = signal(0);

  searchTerm = "";
  selectedStatus: boolean | null = true;

  statusOptions = [
    { label: "Todos", value: null },
    { label: "Ativos", value: true },
    { label: "Inativos", value: false },
  ];

  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.searchSubject
      .pipe(debounceTime(400))
      .subscribe(() => this.loadProducts({ first: 0, rows: 20 }));
  }

  ngOnInit(): void {
    this.loadProducts({ first: 0, rows: 20 });
    this.loadLowStockCount();
  }

  loadProducts(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.productService
      .findAll(page, event.rows, this.searchTerm, this.selectedStatus)
      .subscribe({
        next: (response: Page<Product>) => {
          this.products.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar os produtos",
          });
        },
      });
  }

  loadLowStockCount(): void {
    this.productService.countLowStock().subscribe({
      next: (response) => this.lowStockCount.set(response.count),
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onStatusChange(): void {
    this.loadProducts({ first: 0, rows: 20 });
  }

  confirmToggleStatus(product: Product): void {
    const action = product.active ? "desativar" : "ativar";
    this.confirmationService.confirm({
      message: `Deseja realmente ${action} o produto "${product.name}"?`,
      header: "Confirmar",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: `Sim, ${action}`,
      rejectLabel: "Cancelar",
      accept: () => this.toggleStatus(product),
    });
  }

  toggleStatus(product: Product): void {
    this.productService.toggleStatus(product.id!).subscribe({
      next: () => {
        const action = product.active ? "desativado" : "ativado";
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Produto ${action} com sucesso`,
        });
        this.loadProducts({ first: 0, rows: 20 });
        this.loadLowStockCount();
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar o status",
        });
      },
    });
  }

  getStockSeverity(product: Product): Severity {
    if (product.lowStock) return "danger";
    if (product.stockQuantity! <= product.minimumStock! * 2) return "warning";
    return "success";
  }
}
