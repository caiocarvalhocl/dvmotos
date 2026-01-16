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
  VeiculoService,
  Veiculo,
} from "../../../core/services/veiculo.service";
import { Page } from "../../../core/services/cliente.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-veiculo-list",
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
  templateUrl: "./veiculo-list.component.html",
  styleUrls: ["./veiculo-list.component.scss"],
})
export class VeiculoListComponent implements OnInit {
  veiculos = signal<Veiculo[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";

  private searchSubject = new Subject<string>();

  constructor(
    private veiculoService: VeiculoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.loadVeiculos({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadVeiculos({ first: 0, rows: 20 });
  }

  loadVeiculos(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;

    this.veiculoService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Veiculo>) => {
        this.veiculos.set(response.content);
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

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  confirmDelete(veiculo: Veiculo): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o veículo "${veiculo.placa}"?`,
      header: "Confirmar Exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar",
      rejectLabel: "Cancelar",
      accept: () => this.deleteVeiculo(veiculo),
    });
  }

  deleteVeiculo(veiculo: Veiculo): void {
    this.veiculoService.delete(veiculo.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Veículo desativado com sucesso",
        });
        this.loadVeiculos({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível desativar o veículo",
        });
      },
    });
  }
}
