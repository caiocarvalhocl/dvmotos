import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmationService, MessageService } from "primeng/api";
import { ClientService, Client } from "../../../core/services/client.service";
import {
  FilterState,
  TableFilterComponent,
} from "@shared/components/table-filter/table-filter.component";
import { TableActionsComponent } from "@shared/components/table-actions/table-actions.component";

@Component({
  selector: "app-client-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TableFilterComponent,
    TableActionsComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./client-list.component.html",
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  currentFilter: FilterState = { search: "", active: null };

  constructor(
    private clientService: ClientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadClients({ first: 0, rows: 20 });
  }

  onFilter(filter: FilterState): void {
    this.currentFilter = filter;
    this.loadClients({ first: 0, rows: 20 });
  }

  loadClients(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;

    this.clientService
      .findAll(page, event.rows, this.currentFilter.search, this.currentFilter.active)
      .subscribe({
        next: (response) => {
          this.clients.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar os clientes",
          });
        },
      });
  }

  confirmToggleStatus(client: Client): void {
    const action = client.active ? "desativar" : "ativar";
    this.confirmationService.confirm({
      message: `Deseja realmente ${action} o cliente "${client.name}"?`,
      header: "Confirmar",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: `Sim, ${action}`,
      rejectLabel: "Cancelar",
      rejectButtonStyleClass: "p-button-text p-button-secondary",
      acceptButtonStyleClass: "p-button-text p-button-primary text-white mx-2",
      accept: () => this.toggleStatus(client),
    });
  }

  toggleStatus(client: Client): void {
    this.clientService.toggleStatus(client.id!).subscribe({
      next: () => {
        const action = client.active ? "desativado" : "ativado";
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Cliente ${action} com sucesso`,
        });
        this.loadClients({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar o status do cliente",
        });
      },
    });
  }
}
