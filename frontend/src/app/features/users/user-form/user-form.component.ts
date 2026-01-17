import { Component, OnInit, signal } from "@angular/core";
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

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextModule, ButtonModule, DropdownModule, PasswordModule, ToastModule],
  providers: [MessageService],
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.scss"],
})
export class UserFormComponent implements OnInit {
  user: User = { name: "", email: "", password: "", role: "OPERADOR" };
  isEditing = signal(false);
  saving = signal(false);
  roles = [{ label: "Administrador", value: "ADMIN" }, { label: "Operador", value: "OPERADOR" }];

  constructor(private userService: UserService, private messageService: MessageService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) { this.isEditing.set(true); this.loadUser(+id); }
  }

  loadUser(id: number): void {
    this.userService.findById(id).subscribe({
      next: (user) => { this.user = user; this.user.password = ""; },
      error: () => { this.messageService.add({ severity: "error", summary: "Erro", detail: "Usuário não encontrado" }); this.router.navigate(["/users"]); },
    });
  }

  onSubmit(): void {
    this.saving.set(true);
    const operation = this.isEditing() ? this.userService.update(this.user.id!, this.user) : this.userService.create(this.user);
    operation.subscribe({
      next: () => { this.messageService.add({ severity: "success", summary: "Sucesso", detail: this.isEditing() ? "Usuário atualizado!" : "Usuário cadastrado!" }); setTimeout(() => this.router.navigate(["/users"]), 1500); },
      error: (err) => { this.saving.set(false); this.messageService.add({ severity: "error", summary: "Erro", detail: err.error?.message || "Não foi possível salvar o usuário" }); },
    });
  }
}
