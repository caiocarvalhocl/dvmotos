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
// Importe seu AuthService real aqui
import { AuthService } from "../../../core/services/auth.service";

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
  ],
  providers: [MessageService],
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.scss"],
})
export class UserFormComponent implements OnInit {
  user: User = { name: "", email: "", password: "", role: "OPERADOR" };
  isEditing = signal(false);
  saving = signal(false);

  // Usuário logado no sistema
  currentUser = signal<User | null>(null);

  roles = [
    { label: "Administrador", value: "ADMIN" },
    { label: "Operador", value: "OPERADOR" },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService, // Injete o AuthService
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // 1. Obter usuário logado (simulação, adapte para seu método real)
    const logged = this.authService.currentUser();
    this.currentUser.set(logged);

    const idParam = this.route.snapshot.paramMap.get("id");

    // REGRA 1: Se for Operador tentando acessar rota de edição com ID diferente do dele
    if (logged?.role === "OPERADOR" && idParam && +idParam !== logged.id) {
      this.messageService.add({
        severity: "warn",
        summary: "Acesso Negado",
        detail: "Você só pode editar seu próprio perfil.",
      });
      this.router.navigate(["/home"]); // ou para onde desejar
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
        this.user.password = ""; // Limpa hash da senha por segurança
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

  // --- REGRAS DE VISUALIZAÇÃO ---

  // Regra: Apenas ADMIN pode ver/mudar o dropdown de Role.
  // Operador não pode se promover a Admin.
  canEditRole(): boolean {
    return this.currentUser()?.role === "ADMIN";
  }

  // Regra:
  // 1. Criando novo usuário? Pode definir senha.
  // 2. Editando a si mesmo? Pode mudar senha.
  // 3. Admin editando outro? NÃO pode mudar senha (REGRA SOLICITADA).
  canEditPassword(): boolean {
    // Se for criação (novo usuário), sempre permite (senha é obrigatória)
    if (!this.isEditing()) return true;

    // Se estiver editando, só pode se for o próprio usuário
    const loggedId = this.currentUser()?.id;
    const targetId = this.user.id;

    return loggedId === targetId;
  }

  onSubmit(): void {
    this.saving.set(true);

    // Segurança extra: Se não for admin, garante que o role enviado é o original (evita injeção)
    if (!this.canEditRole() && this.isEditing()) {
      // Mantém o role original ou força OPERADOR se for novo cadastro self-service
      // Aqui assumimos que loadUser já preencheu o objeto corretamente
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
        // Se for operador editando a si mesmo, talvez não deva voltar para /users, mas sim dashboard
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
      this.router.navigate(["/dashboard"]); // ou '/home' dependendo da sua rota
    }
  }
}
