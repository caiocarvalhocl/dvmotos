import { Component, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { FormFieldComponent } from "@shared/components/form-field/form-field.component";
import {
  ServiceOrderService,
  ServiceOrder,
  ServiceOrderItem,
  ServiceOrderStatus,
  ServiceOrderItemType,
} from "../../../core/services/service-order.service";
import { ClientService, Client } from "../../../core/services/client.service";
import {
  VehicleService,
  Vehicle,
} from "../../../core/services/vehicle.service";
import {
  ProductService,
  Product,
} from "../../../core/services/product.service";
import { Severity } from "@shared/types/Severity";

@Component({
  selector: "app-service-order-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    AutoCompleteModule,
    ButtonModule,
    TableModule,
    TagModule,
    CardModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    CurrencyPipe,
    DatePipe,
    FormFieldComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./service-order-form.component.html",
})
export class ServiceOrderFormComponent implements OnInit {
  order: ServiceOrder = {
    clientId: 0,
    vehicleId: 0,
    entryMileage: undefined,
    discountAmount: 0,
    notes: "",
    items: [],
  };

  isEditing = signal(false);
  saving = signal(false);
  loading = signal(false);

  // Client autocomplete
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;

  // Vehicle dropdown (filtered by client)
  clientVehicles: Vehicle[] = [];

  // Product autocomplete (for item dialog)
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Item dialog
  showItemDialog = false;
  newItem: ServiceOrderItem = {
    type: "SERVICE",
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
  selectedProduct: Product | null = null;

  itemTypeOptions = [
    { label: "Serviço (mão de obra)", value: "SERVICE" },
    { label: "Peça / Produto", value: "PART" },
  ];

  constructor(
    private serviceOrderService: ServiceOrderService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing.set(true);
      this.loadOrder(+id);
    }
  }

  // ======================== DATA LOADING ========================

  loadOrder(id: number): void {
    this.loading.set(true);
    this.serviceOrderService.findById(id).subscribe({
      next: (order) => {
        this.order = order;
        // Load client for autocomplete display
        if (order.clientId) {
          this.clientService.findById(order.clientId).subscribe({
            next: (client) => {
              this.selectedClient = client;
              this.loadClientVehicles(client.id!);
            },
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "OS não encontrada",
        });
        this.router.navigate(["/service-orders"]);
      },
    });
  }

  loadClients(): void {
    this.clientService.findAll(0, 200, "", true).subscribe({
      next: (response) => (this.clients = response.content),
    });
  }

  loadProducts(): void {
    this.productService.findAll(0, 500, "", true).subscribe({
      next: (response) => (this.products = response.content),
    });
  }

  loadClientVehicles(clientId: number): void {
    this.vehicleService.findByClient(clientId).subscribe({
      next: (vehicles) => (this.clientVehicles = vehicles),
    });
  }

  // ======================== AUTOCOMPLETE ========================

  filterClients(event: any): void {
    this.filteredClients = this.clients.filter((c) =>
      c.name.toLowerCase().includes(event.query.toLowerCase()),
    );
  }

  onClientSelect(event: any): void {
    const client = event.value;
    this.order.clientId = client.id;
    this.order.vehicleId = 0;
    this.clientVehicles = [];
    this.loadClientVehicles(client.id);
  }

  onClientClear(): void {
    this.order.clientId = 0;
    this.order.vehicleId = 0;
    this.clientVehicles = [];
  }

  filterProducts(event: any): void {
    this.filteredProducts = this.products.filter((p) =>
      p.name.toLowerCase().includes(event.query.toLowerCase()),
    );
  }

  onProductSelect(event: any): void {
    const product = event.value;
    this.newItem.productId = product.id;
    this.newItem.description = product.name;
    this.newItem.unitPrice = product.salePrice;
  }

  // ======================== ITEM MANAGEMENT ========================

  openItemDialog(): void {
    this.newItem = {
      type: "SERVICE",
      description: "",
      quantity: 1,
      unitPrice: 0,
    };
    this.selectedProduct = null;
    this.showItemDialog = true;
  }

  onItemTypeChange(): void {
    this.newItem.productId = undefined;
    this.newItem.description = "";
    this.newItem.unitPrice = 0;
    this.selectedProduct = null;
  }

  addItem(): void {
    if (
      !this.newItem.description ||
      this.newItem.unitPrice <= 0 ||
      this.newItem.quantity < 1
    ) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos do item",
      });
      return;
    }

    if (this.isEditing()) {
      // Add via API
      this.serviceOrderService.addItem(this.order.id!, this.newItem).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.showItemDialog = false;
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Item adicionado",
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: err.error?.message || "Não foi possível adicionar o item",
          });
        },
      });
    } else {
      // Add locally (will be sent on create)
      this.order.items = this.order.items || [];
      this.order.items.push({
        ...this.newItem,
        totalPrice: this.newItem.unitPrice * this.newItem.quantity,
      });
      this.showItemDialog = false;
    }
  }

  confirmRemoveItem(item: ServiceOrderItem, index: number): void {
    this.confirmationService.confirm({
      message: `Remover "${item.description}" da OS?`,
      header: "Confirmar Remoção",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, remover",
      rejectLabel: "Cancelar",
      accept: () => this.removeItem(item, index),
    });
  }

  removeItem(item: ServiceOrderItem, index: number): void {
    if (this.isEditing() && item.id) {
      this.serviceOrderService.removeItem(this.order.id!, item.id).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Item removido",
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: err.error?.message || "Não foi possível remover o item",
          });
        },
      });
    } else {
      this.order.items!.splice(index, 1);
    }
  }

  // ======================== STATUS ========================

  changeStatus(newStatus: ServiceOrderStatus): void {
    const labels: Record<string, string> = {
      IN_PROGRESS: "iniciar",
      COMPLETED: "concluir",
      WAITING_PARTS: "marcar como aguardando peças",
      CANCELLED: "cancelar",
    };

    this.confirmationService.confirm({
      message: `Deseja ${labels[newStatus]} esta OS?`,
      header: "Alterar Status",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      accept: () => {
        this.serviceOrderService
          .changeStatus(this.order.id!, newStatus)
          .subscribe({
            next: (updatedOrder) => {
              this.order = updatedOrder;
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Status atualizado",
              });
            },
            error: (err) => {
              this.messageService.add({
                severity: "error",
                summary: "Erro",
                detail:
                  err.error?.message || "Não foi possível alterar o status",
              });
            },
          });
      },
    });
  }

  // ======================== SAVE ========================

  onSubmit(): void {
    if (!this.order.clientId || !this.order.vehicleId) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione cliente e veículo",
      });
      return;
    }

    this.saving.set(true);
    const request = {
      clientId: this.order.clientId,
      vehicleId: this.order.vehicleId,
      entryMileage: this.order.entryMileage,
      notes: this.order.notes,
      discountAmount: this.order.discountAmount || 0,
      items: this.order.items || [],
    };

    const operation = this.isEditing()
      ? this.serviceOrderService.update(this.order.id!, request)
      : this.serviceOrderService.create(request);

    operation.subscribe({
      next: (savedOrder) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing() ? "OS atualizada!" : "OS criada!",
        });
        if (!this.isEditing()) {
          // Navigate to edit mode after creation
          setTimeout(
            () => this.router.navigate(["/service-orders", savedOrder.id]),
            1000,
          );
        } else {
          this.order = savedOrder;
          this.saving.set(false);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar a OS",
        });
      },
    });
  }

  // ======================== HELPERS ========================

  get isEditable(): boolean {
    return (
      !this.isEditing() ||
      this.order.status === "OPEN" ||
      this.order.status === "IN_PROGRESS"
    );
  }

  get localTotal(): number {
    if (!this.order.items) return 0;
    const sum = this.order.items.reduce(
      (acc, item) => acc + (item.totalPrice || item.unitPrice * item.quantity),
      0,
    );
    return sum - (this.order.discountAmount || 0);
  }

  getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      OPEN: "Aberta",
      IN_PROGRESS: "Em Andamento",
      WAITING_PARTS: "Aguardando Peças",
      COMPLETED: "Concluída",
      CANCELLED: "Cancelada",
    };
    return labels[status || ""] || status || "";
  }

  getStatusSeverity(status?: string): Severity {
    const severities: Record<string, Severity> = {
      OPEN: "info",
      IN_PROGRESS: "warning",
      WAITING_PARTS: "warning",
      COMPLETED: "success",
      CANCELLED: "danger",
    };
    return severities[status || ""] || "info";
  }

  getItemTypeLabel(type: string): string {
    return type === "SERVICE" ? "Serviço" : "Peça";
  }

  getItemTypeSeverity(type: string): Severity {
    return type === "SERVICE" ? "info" : "success";
  }
}
