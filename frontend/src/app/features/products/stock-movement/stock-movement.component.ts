import { Component, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextareaModule } from "primeng/inputtextarea";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  ProductService,
  Product,
  StockMovement,
  Page,
} from "../../../core/services/product.service";
import { Severity } from "@shared/types/Severity";

@Component({
  selector: "app-stock-movement",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    ToastModule,
    CurrencyPipe,
    DatePipe,
  ],
  providers: [MessageService],
  templateUrl: "./stock-movement.component.html",
  styleUrls: ["./stock-movement.component.scss"],
})
export class StockMovementComponent implements OnInit {
  product: Product | null = null;
  movements = signal<StockMovement[]>([]);
  loading = signal(true);
  saving = signal(false);
  totalRecords = signal(0);

  movementType: "IN" | "OUT" | "ADJUSTMENT" = "IN";
  quantity: number = 1;
  reason: string = "";

  typeOptions = [
    { label: "Entrada", value: "IN" },
    { label: "Saída", value: "OUT" },
    { label: "Ajuste", value: "ADJUSTMENT" },
  ];

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params["id"];
    if (id) {
      this.loadProduct(id);
      this.loadMovements(id, { first: 0, rows: 10 });
    } else {
      this.router.navigate(["/products"]);
    }
  }

  loadProduct(id: number): void {
    this.productService.findById(id).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Produto não encontrado",
        });
        this.router.navigate(["/products"]);
      },
    });
  }

  loadMovements(productId: number, event: any): void {
    const page = event.first / event.rows;
    this.productService.getStockHistory(productId, page, event.rows).subscribe({
      next: (response: Page<StockMovement>) => {
        this.movements.set(response.content);
        this.totalRecords.set(response.totalElements);
      },
    });
  }

  onSubmit(): void {
    if (!this.quantity || this.quantity <= 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Quantidade deve ser maior que zero",
      });
      return;
    }

    this.saving.set(true);
    this.productService
      .addStockMovement(this.product!.id!, {
        type: this.movementType,
        quantity: this.quantity,
        reason: this.reason,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Movimentação registrada",
          });
          this.loadProduct(this.product!.id!);
          this.loadMovements(this.product!.id!, { first: 0, rows: 10 });
          this.quantity = 1;
          this.reason = "";
          this.saving.set(false);
        },
        error: (err: any) => {
          this.saving.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail:
              err.error?.message || "Não foi possível registrar a movimentação",
          });
        },
      });
  }

  getTypeSeverity(type: string): Severity {
    switch (type) {
      case "IN":
        return "success";
      case "OUT":
        return "danger";
      default:
        return "info";
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case "IN":
        return "Entrada";
      case "OUT":
        return "Saída";
      default:
        return "Ajuste";
    }
  }
}
