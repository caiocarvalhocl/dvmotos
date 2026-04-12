import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  VehicleService,
  Vehicle,
} from "../../../core/services/vehicle.service";
import { ClientService, Client } from "../../../core/services/client.service";
import { FormFieldComponent } from "@shared/components/form-field/form-field.component";

@Component({
  selector: "app-vehicle-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputMaskModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    AutoCompleteModule,
    ToastModule,
    FormFieldComponent,
  ],
  providers: [MessageService],
  templateUrl: "./vehicle-form.component.html",
})
export class VehicleFormComponent implements OnInit {
  vehicle: Vehicle = {
    clientId: 0,
    licensePlate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    chassisNumber: "",
    currentMileage: undefined,
    notes: "",
  };
  isEditing = signal(false);
  saving = signal(false);
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;

  constructor(
    private vehicleService: VehicleService,
    private clientService: ClientService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing.set(true);
      this.loadVehicle(+id);
    }
    this.loadClients();
  }

  loadVehicle(id: number): void {
    this.vehicleService.findById(id).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle;
        this.loadClientForVehicle();
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Veículo não encontrado",
        });
        this.router.navigate(["/vehicles"]);
      },
    });
  }

  loadClients(): void {
    this.clientService.findAll(0, 100).subscribe({
      next: (response) => {
        this.clients = response.content;
        this.loadClientForVehicle();
      },
    });
  }

  loadClientForVehicle(): void {
    if (this.vehicle.clientId && this.clients.length > 0) {
      this.selectedClient =
        this.clients.find((c) => c.id === this.vehicle.clientId) || null;
    }
  }

  filterClients(event: any): void {
    this.filteredClients = this.clients.filter((c) =>
      c.name.toLowerCase().includes(event.query.toLowerCase()),
    );
  }
  onClientSelect(event: any): void {
    this.vehicle.clientId = event.value.id;
  }

  onSubmit(): void {
    if (!this.vehicle.clientId) {
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Selecione um cliente",
      });
      return;
    }
    this.saving.set(true);
    const operation = this.isEditing()
      ? this.vehicleService.update(this.vehicle.id!, this.vehicle)
      : this.vehicleService.create(this.vehicle);
    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing()
            ? "Veículo atualizado!"
            : "Veículo cadastrado!",
        });
        setTimeout(() => this.router.navigate(["/vehicles"]), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar o veículo",
        });
      },
    });
  }
}
