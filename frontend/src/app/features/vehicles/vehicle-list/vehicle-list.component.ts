import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";
import { VehicleService, Vehicle } from "../../../core/services/vehicle.service";
import { Page } from "@shared/types/Page";
import {
  FilterState,
  TableFilterComponent,
} from "@shared/components/table-filter/table-filter.component";
import { TooltipModule } from "primeng/tooltip";
import { TableActionsComponent } from "@shared/components/table-actions/table-actions.component";

@Component({
  selector: "app-vehicle-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TableFilterComponent,
    TableActionsComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./vehicle-list.component.html",
})
export class VehicleListComponent implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  currentFilter: FilterState = { search: "", active: null };

  constructor(
    private vehicleService: VehicleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadVehicles({ first: 0, rows: 20 });
  }

  onFilter(filter: FilterState): void {
    this.currentFilter = filter;
    this.loadVehicles({ first: 0, rows: 20 });
  }

  loadVehicles(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;

    this.vehicleService
      .findAll(page, event.rows, this.currentFilter.search, this.currentFilter.active)
      .subscribe({
        next: (response: Page<Vehicle>) => {
          this.vehicles.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar os veículos",
          });
        },
      });
  }

  confirmToggleStatus(vehicle: Vehicle): void {
    const action = vehicle.active ? "desativar" : "ativar";
    this.confirmationService.confirm({
      message: `Deseja realmente ${action} o veículo "${vehicle.licensePlate}"?`,
      header: "Confirmar",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: `Sim, ${action}`,
      rejectLabel: "Cancelar",
      rejectButtonStyleClass: "p-button-text p-button-secondary",
      acceptButtonStyleClass: "p-button-text p-button-primary text-white mx-2",
      accept: () => this.toggleStatus(vehicle),
    });
  }

  toggleStatus(vehicle: Vehicle): void {
    this.vehicleService.toggleStatus(vehicle.id!).subscribe({
      next: () => {
        const action = vehicle.active ? "desativado" : "ativado";
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Veículo ${action} com sucesso`,
        });
        this.loadVehicles({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar o status do veículo",
        });
      },
    });
  }
}
