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
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";
  private searchSubject = new Subject<string>();

  constructor(private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.loadUsers({ first: 0, rows: 20 }));
  }

  ngOnInit(): void { this.loadUsers({ first: 0, rows: 20 }); }

  loadUsers(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.userService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<User>) => { this.users.set(response.content); this.totalRecords.set(response.totalElements); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível carregar os usuários" }); },
    });
  }

  onSearch(term: string): void { this.searchSubject.next(term); }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o usuário "${user.name}"?`,
      header: "Confirmar Exclusão", icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar", rejectLabel: "Cancelar",
      accept: () => this.deleteUser(user),
    });
  }

  deleteUser(user: User): void {
    this.userService.delete(user.id!).subscribe({
      next: () => { this.messageService.add({ severity: "success", summary: "Sucesso", detail: "Usuário desativado com sucesso" }); this.loadUsers({ first: 0, rows: 20 }); },
      error: () => { this.messageService.add({ severity: "error", summary: "Erro", detail: "Não foi possível desativar o usuário" }); },
    });
  }

  getRoleSeverity(role: string): string { return role === 'ADMIN' ? 'danger' : 'info'; }
  getRoleLabel(role: string): string { return role === 'ADMIN' ? 'Administrador' : 'Operador'; }
}
