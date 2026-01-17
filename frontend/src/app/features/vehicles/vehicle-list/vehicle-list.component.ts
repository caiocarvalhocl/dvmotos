import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";
import { VehicleService, Vehicle } from "../../../core/services/vehicle.service";
import { Page } from "../../../core/services/client.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-vehicle-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./vehicle-list.component.html",
  styleUrls: ["./vehicle-list.component.scss"],
})
export class VehicleListComponent implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";
  private searchSubject = new Subject<string>();

  constructor(private vehicleService: VehicleService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadVehicles({ first: 0, rows: 20 }));
  }

  ngOnInit(): void { this.loadVehicles({ first: 0, rows: 20 }); }

  loadVehicles(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.vehicleService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Vehicle>) => { this.vehicles.set(response.content); this.totalRecords.set(response.totalElements); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível carregar os veículos" }); },
    });
  }

  onSearch(term: string): void { this.searchSubject.next(term); }

  confirmDelete(vehicle: Vehicle): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o veículo "${vehicle.licensePlate}"?`,
      header: "Confirmar Exclusão", icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar", rejectLabel: "Cancelar",
      accept: () => this.deleteVehicle(vehicle),
    });
  }

  deleteVehicle(vehicle: Vehicle): void {
    this.vehicleService.delete(vehicle.id!).subscribe({
      next: () => { this.messageService.add({ severity: "success", summary: "Sucesso", detail: "Veículo desativado com sucesso" }); this.loadVehicles({ first: 0, rows: 20 }); },
      error: () => { this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível desativar o veículo" }); },
    });
  }
}
