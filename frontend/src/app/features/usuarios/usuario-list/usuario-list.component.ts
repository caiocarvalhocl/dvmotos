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
import { DialogModule } from "primeng/dialog";
import { PasswordModule } from "primeng/password";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  UsuarioService,
  Usuario,
  Page,
} from "../../../core/services/usuario.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-usuario-list",
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
    DialogModule,
    PasswordModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./usuario-list.component.html",
  styleUrls: ["./usuario-list.component.scss"],
})
export class UsuarioListComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = "";

  // Dialog de senha
  showPasswordDialog = false;
  selectedUsuario: Usuario | null = null;
  novaSenha = "";
  confirmarSenha = "";

  private searchSubject = new Subject<string>();

  constructor(
    private usuarioService: UsuarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.loadUsuarios({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadUsuarios({ first: 0, rows: 20 });
  }

  loadUsuarios(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;

    this.usuarioService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Usuario>) => {
        this.usuarios.set(response.content);
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

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  getInitials(nome: string): string {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  confirmDelete(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o usuário "${usuario.nome}"?`,
      header: "Confirmar Desativação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, desativar",
      rejectLabel: "Cancelar",
      accept: () => this.delete(usuario),
    });
  }

  delete(usuario: Usuario): void {
    this.usuarioService.delete(usuario.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuário desativado",
        });
        this.loadUsuarios({ first: 0, rows: 20 });
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

  activate(usuario: Usuario): void {
    this.usuarioService.activate(usuario.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Usuário reativado",
        });
        this.loadUsuarios({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível reativar o usuário",
        });
      },
    });
  }

  openPasswordDialog(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.novaSenha = "";
    this.confirmarSenha = "";
    this.showPasswordDialog = true;
  }

  changePassword(): void {
    if (
      !this.selectedUsuario ||
      !this.novaSenha ||
      this.novaSenha !== this.confirmarSenha
    ) {
      return;
    }

    this.usuarioService
      .changePassword(this.selectedUsuario.id!, this.novaSenha)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Senha alterada com sucesso",
          });
          this.showPasswordDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível alterar a senha",
          });
        },
      });
  }
}
