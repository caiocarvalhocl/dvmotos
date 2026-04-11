import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  CategoryService,
  Category,
} from "../../../core/services/category.service";
import { FormFieldComponent } from "@shared/components/form-field/form-field.component";

@Component({
  selector: "app-category-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    ToastModule,
    FormFieldComponent,
  ],
  providers: [MessageService],
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.scss"],
})
export class CategoryFormComponent implements OnInit {
  category: Category = { name: "" };
  isEditing = signal(false);
  saving = signal(false);
  loading = signal(false);

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params["id"];
    if (id) {
      this.isEditing.set(true);
      this.loadCategory(id);
    }
  }

  loadCategory(id: number): void {
    this.loading.set(true);
    this.categoryService.findById(id).subscribe({
      next: (category: Category) => {
        this.category = category;
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Categoria não encontrada",
        });
        this.loading.set(false);
        this.router.navigate(["/categories"]);
      },
    });
  }

  onSubmit(): void {
    if (!this.category.name?.trim()) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Nome é obrigatório",
      });
      return;
    }

    this.saving.set(true);
    const operation = this.isEditing()
      ? this.categoryService.update(this.category.id!, this.category)
      : this.categoryService.create(this.category);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Categoria ${this.isEditing() ? "atualizada" : "criada"} com sucesso`,
        });
        setTimeout(() => this.router.navigate(["/categories"]), 1000);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar a categoria",
        });
      },
    });
  }
}
