import { Component, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { DropdownModule } from "primeng/dropdown";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  FilterState,
  TableFilterComponent,
} from "@shared/components/table-filter/table-filter.component";
import { TableActionsComponent } from "@shared/components/table-actions/table-actions.component";
import {
  ServiceOrderService,
  ServiceOrder,
  ServiceOrderStatus,
} from "../../../core/services/service-order.service";
import { Page } from "../../../core/services/client.service";
import { Severity } from "@shared/types/Severity";

@Component({
  selector: "app-service-order-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    DropdownModule,
    ConfirmDialogModule,
    CurrencyPipe,
    DatePipe,
    TableFilterComponent,
    TableActionsComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./service-order-list.component.html",
  styleUrls: ["./service-order-list.component.scss"],
})
export class ServiceOrderListComponent implements OnInit {
  orders = signal<ServiceOrder[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  currentFilter: FilterState = { search: "", active: null };
  selectedStatus: ServiceOrderStatus | null = null;

  statusOptions = [
    { label: "Todos os Status", value: null },
    { label: "Abertas", value: "OPEN" },
    { label: "Em Andamento", value: "IN_PROGRESS" },
    { label: "Aguardando Peças", value: "WAITING_PARTS" },
    { label: "Concluídas", value: "COMPLETED" },
    { label: "Canceladas", value: "CANCELLED" },
  ];

  constructor(
    private serviceOrderService: ServiceOrderService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadOrders({ first: 0, rows: 20 });
  }

  onFilter(filter: FilterState): void {
    this.currentFilter = filter;
    this.loadOrders({ first: 0, rows: 20 });
  }

  onStatusChange(): void {
    this.loadOrders({ first: 0, rows: 20 });
  }

  loadOrders(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.serviceOrderService
      .findAll(page, event.rows, this.currentFilter.search, this.selectedStatus)
      .subscribe({
        next: (response: Page<ServiceOrder>) => {
          this.orders.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar as ordens de serviço",
          });
        },
      });
  }

  confirmCancel(order: ServiceOrder): void {
    this.confirmationService.confirm({
      message: `Deseja realmente cancelar a OS #${order.id}?`,
      header: "Cancelar Ordem de Serviço",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, cancelar",
      rejectLabel: "Não",
      accept: () => this.cancelOrder(order),
    });
  }

  cancelOrder(order: ServiceOrder): void {
    this.serviceOrderService.changeStatus(order.id!, "CANCELLED").subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "OS cancelada com sucesso",
        });
        this.loadOrders({ first: 0, rows: 20 });
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível cancelar a OS",
        });
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      OPEN: "Aberta",
      IN_PROGRESS: "Em Andamento",
      WAITING_PARTS: "Aguard. Peças",
      COMPLETED: "Concluída",
      CANCELLED: "Cancelada",
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): Severity {
    const severities: Record<string, Severity> = {
      OPEN: "info",
      IN_PROGRESS: "warning",
      WAITING_PARTS: "warning",
      COMPLETED: "success",
      CANCELLED: "danger",
    };
    return severities[status] || "info";
  }

  canCancel(order: ServiceOrder): boolean {
    return order.status !== "COMPLETED" && order.status !== "CANCELLED";
  }
}
