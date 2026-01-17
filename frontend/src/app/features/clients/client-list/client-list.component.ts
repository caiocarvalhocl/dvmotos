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
import { ClientService, Client, Page } from "../../../core/services/client.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-client-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./client-list.component.html",
  styleUrls: ["./client-list.component.scss"],
})
export class ClientListComponent implements OnInit {
  clients = signal<Client[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";
  private searchSubject = new Subject<string>();

  constructor(private clientService: ClientService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadClients({ first: 0, rows: 20 }));
  }

  ngOnInit(): void { this.loadClients({ first: 0, rows: 20 }); }

  loadClients(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.clientService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Client>) => { this.clients.set(response.content); this.totalRecords.set(response.totalElements); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível carregar os clientes" }); },
    });
  }

  onSearch(term: string): void { this.searchSubject.next(term); }

  confirmDelete(client: Client): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o cliente "${client.name}"?`,
      header: "Confirmar Exclusão", icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar", rejectLabel: "Cancelar",
      accept: () => this.deleteClient(client),
    });
  }

  deleteClient(client: Client): void {
    this.clientService.delete(client.id!).subscribe({
      next: () => { this.messageService.add({ severity: "success", summary: "Sucesso", detail: "Cliente desativado com sucesso" }); this.loadClients({ first: 0, rows: 20 }); },
      error: () => { this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível desativar o cliente" }); },
    });
  }
}
