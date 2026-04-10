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
import { UserService, User, Page } from "../../../core/services/user.service";
import { TableActionsComponent } from "@shared/components/table-actions/table-actions.component";
import {
  FilterState,
  TableFilterComponent,
} from "@shared/components/table-filter/table-filter.component";
import { Severity } from "@shared/types/Severity";

@Component({
  selector: "app-user-list",
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
    TableFilterComponent,
    TableActionsComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadUsers({ first: 0, rows: 20 });
  }

  currentFilter: FilterState = { search: "", active: null };

  onFilter(filter: FilterState): void {
    this.currentFilter = filter;
    // Sempre que filtrar, volta para página 1
    this.loadUsers({ first: 0, rows: 20 });
  }

  loadUsers(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.userService
      .findAll(
        page,
        event.rows,
        this.currentFilter.search,
        this.currentFilter.active,
      )
      .subscribe({
        next: (response: Page<User>) => {
          this.users.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar os usuários",
          });
        },
      });
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o usuário "${user.name}"?`,
      header: "Confirmar Exclusão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar",
      rejectLabel: "Cancelar",
      accept: () => this.deleteUser(user),
    });
  }

  deleteUser(user: User): void {
    this.userService.delete(user.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuário desativado com sucesso",
        });
        this.loadUsers({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível desativar o usuário",
        });
      },
    });
  }

  getRoleSeverity(role: string): Severity {
    return role === "ADMIN" ? "danger" : "info";
  }
  getRoleLabel(role: string): string {
    return role === "ADMIN" ? "Administrador" : "Operador";
  }

  confirmToggleStatus(user: User): void {
    const action = user.active ? "desativar" : "ativar";
    this.confirmationService.confirm({
      message: `Deseja realmente ${action} o usuário "${user.name}"?`,
      header: "Confirmar Ação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: `Sim, ${action}`,
      rejectLabel: "Cancelar",
      rejectButtonStyleClass: "p-button-text p-button-secondary",
      acceptButtonStyleClass: "p-button-text p-button-primary text-white mx-2",
      accept: () => this.toggleStatus(user),
    });
  }

  toggleStatus(user: User): void {
    this.userService.toggleStatus(user.id!).subscribe({
      next: () => {
        const action = user.active ? "desativado" : "ativado";
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Usuário ${action} com sucesso`,
        });
        this.loadUsers({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar o status do usuário",
        });
      },
    });
  }
}
