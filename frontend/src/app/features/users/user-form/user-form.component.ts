import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { PasswordModule } from "primeng/password";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { UserService, User } from "../../../core/services/user.service";
import { AuthService } from "../../../core/services/auth.service";
import { FormFieldComponent } from "@shared/components/form-field/form-field.component";

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    PasswordModule,
    ToastModule,
    FormFieldComponent,
  ],
  providers: [MessageService],
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.scss"],
})
export class UserFormComponent implements OnInit {
  user: User = { name: "", email: "", password: "", role: "OPERADOR" };
  isEditing = signal(false);
  saving = signal(false);

  currentUser = signal<User | null>(null);

  roles = [
    { label: "Administrador", value: "ADMIN" },
    { label: "Operador", value: "OPERADOR" },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const logged = this.authService.currentUser();
    this.currentUser.set(logged);

    const idParam = this.route.snapshot.paramMap.get("id");

    if (logged?.role === "OPERADOR" && idParam && +idParam !== logged.id) {
      this.messageService.add({
        severity: "warn",
        summary: "Acesso Negado",
        detail: "Você só pode editar seu próprio perfil.",
      });
      this.router.navigate(["/home"]);
      return;
    }

    if (idParam) {
      this.isEditing.set(true);
      this.loadUser(+idParam);
    }
  }

  loadUser(id: number): void {
    this.userService.findById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.user.password = "";
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Usuário não encontrado",
        });
        this.router.navigate(["/users"]);
      },
    });
  }

  // Regra: Apenas ADMIN pode ver/mudar o dropdown de Role.

  canEditRole(): boolean {
    return (
      this.currentUser()?.role === "ADMIN" &&
      this.currentUser()?.id !== this.user.id
    );
  }

  // Regra:
  // 1. Criando novo usuário? Pode definir senha.
  // 2. Editando a si mesmo? Pode mudar senha.
  // 3. Admin editando outro? NÃO pode mudar senha (REGRA SOLICITADA).
  canEditPassword(): boolean {
    if (!this.isEditing()) return true;

    const loggedId = this.currentUser()?.id;
    const targetId = this.user.id;

    return loggedId === targetId;
  }

  onSubmit(): void {
    this.saving.set(true);

    if (!this.canEditRole() && this.isEditing()) {
    }

    const operation = this.isEditing()
      ? this.userService.update(this.user.id!, this.user)
      : this.userService.create(this.user);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing()
            ? "Dados atualizados!"
            : "Usuário cadastrado!",
        });

        const redirect =
          this.currentUser()?.role === "ADMIN" ? ["/users"] : ["/dashboard"];
        setTimeout(() => this.router.navigate(redirect), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Erro ao salvar",
        });
      },
    });
  }
  onCancel(): void {
    if (this.canEditRole()) {
      this.router.navigate(["/users"]);
    } else {
      this.router.navigate(["/dashboard"]);
    }
  }
}
