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
import {
  ClienteService,
  Cliente,
  Page,
} from "../../../core/services/cliente.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-cliente-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./cliente-list.component.html",
  styleUrls: ["./cliente-list.component.scss"],
})
export class ClienteListComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";

  private searchSubject = new Subject<string>();

  constructor(
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.loadClientes({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadClientes({ first: 0, rows: 20 });
  }

  loadClientes(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;

    this.clienteService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Cliente>) => {
        this.clientes.set(response.content);
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

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  confirmDelete(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o cliente "${cliente.nome}"?`,
      header: "Confirmar Exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar",
      rejectLabel: "Cancelar",
      accept: () => this.deleteCliente(cliente),
    });
  }

  deleteCliente(cliente: Cliente): void {
    this.clienteService.delete(cliente.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Cliente desativado com sucesso",
        });
        this.loadClientes({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível desativar o cliente",
        });
      },
    });
  }
}
