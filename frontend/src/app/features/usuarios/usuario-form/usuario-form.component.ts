import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { MessageModule } from "primeng/message";
import { MessageService } from "primeng/api";
import {
  UsuarioService,
  Usuario,
} from "../../../core/services/usuario.service";

@Component({
  selector: "app-usuario-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    MessageModule,
  ],
  providers: [MessageService],
  templateUrl: "./usuario-form.component.html",
  styleUrls: ["./usuario-form.component.scss"],
})
export class UsuarioFormComponent implements OnInit {
  usuario: Usuario = {
    nome: "",
    email: "",
    senha: "",
    role: "OPERADOR",
  };

  confirmarSenha = "";
  isEditing = signal(false);
  saving = signal(false);

  roles = [
    { label: "Administrador", value: "ADMIN" },
    { label: "Operador", value: "OPERADOR" },
  ];

  constructor(
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing.set(true);
      this.loadUsuario(+id);
    }
  }

  loadUsuario(id: number): void {
    this.usuarioService.findById(id).subscribe({
      next: (usuario) => {
        this.usuario = { ...usuario, senha: "" };
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Usuário não encontrado",
        });
        this.router.navigate(["/usuarios"]);
      },
    });
  }

  onSubmit(): void {
    // Validação de senha
    if (this.usuario.senha && this.usuario.senha !== this.confirmarSenha) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "As senhas não conferem",
      });
      return;
    }

    this.saving.set(true);

    // Se editando e senha vazia, não envia senha
    const payload = { ...this.usuario };
    if (this.isEditing() && !payload.senha) {
      delete payload.senha;
    }

    const operation = this.isEditing()
      ? this.usuarioService.update(this.usuario.id!, payload)
      : this.usuarioService.create(payload);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing()
            ? "Usuário atualizado!"
            : "Usuário cadastrado!",
        });
        setTimeout(() => this.router.navigate(["/usuarios"]), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar o usuário",
        });
      },
    });
  }
}
