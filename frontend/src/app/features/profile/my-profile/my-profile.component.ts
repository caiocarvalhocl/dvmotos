import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { PasswordModule } from "primeng/password";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  UserService,
  User,
  ChangePasswordRequest,
} from "../../../core/services/user.service";
import { AuthService } from "../../../core/services/auth.service";

type SEVERITY =
  | "success"
  | "info"
  | "secondary"
  | "contrast"
  | "warning"
  | "danger"
  | undefined;

@Component({
  selector: "app-my-profile",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    CardModule,
    DividerModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./my-profile.component.html",
  styleUrls: ["./my-profile.component.scss"],
})
export class MyProfileComponent implements OnInit {
  user: User = { name: "", email: "", role: "OPERADOR" };
  loading = signal(true);
  savingProfile = signal(false);
  savingPassword = signal(false);

  // Password change
  currentPassword = "";
  newPassword = "";
  confirmPassword = "";

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível carregar o perfil",
        });
        this.loading.set(false);
      },
    });
  }

  onSaveProfile(): void {
    if (!this.user.name || !this.user.email) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    this.savingProfile.set(true);
    this.userService
      .updateMyProfile({ name: this.user.name, email: this.user.email })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          // Update stored user in auth service
          const storedUser = this.authService.currentUser();
          if (storedUser) {
            localStorage.setItem(
              "dvmotos_user",
              JSON.stringify({
                ...storedUser,
                name: updatedUser.name,
                email: updatedUser.email,
              }),
            );
          }
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Perfil atualizado com sucesso!",
          });
          this.savingProfile.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: err.error?.message || "Não foi possível atualizar o perfil",
          });
          this.savingProfile.set(false);
        },
      });
  }

  onChangePassword(): void {
    // Validations
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos de senha",
      });
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "A nova senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "A nova senha e a confirmação não coincidem",
      });
      return;
    }

    this.savingPassword.set(true);
    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };

    this.userService.changeMyPassword(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Senha alterada com sucesso!",
        });
        // Clear password fields
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.savingPassword.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível alterar a senha",
        });
        this.savingPassword.set(false);
      },
    });
  }

  getRoleLabel(role: string): string {
    return role === "ADMIN" ? "Administrador" : "Operador";
  }

  getRoleSeverity(role: string): SEVERITY {
    return role === "ADMIN" ? "danger" : "info";
  }

  getUserInitials(): string {
    const name = this.user?.name || "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
