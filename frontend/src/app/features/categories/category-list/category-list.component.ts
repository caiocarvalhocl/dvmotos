import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  CategoryService,
  Category,
  Page,
} from "../../../core/services/category.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-category-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.scss"],
})
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  searchTerm = "";
  selectedStatus: boolean | null = true;

  statusOptions = [
    { label: "Todos", value: null },
    { label: "Ativos", value: true },
    { label: "Inativos", value: false },
  ];

  private searchSubject = new Subject<string>();

  constructor(
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.searchSubject
      .pipe(debounceTime(400))
      .subscribe(() => this.loadCategories({ first: 0, rows: 20 }));
  }

  ngOnInit(): void {
    this.loadCategories({ first: 0, rows: 20 });
  }

  loadCategories(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    this.categoryService
      .findAll(page, event.rows, this.searchTerm, this.selectedStatus)
      .subscribe({
        next: (response: Page<Category>) => {
          this.categories.set(response.content);
          this.totalRecords.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Não foi possível carregar as categorias",
          });
        },
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onStatusChange(): void {
    this.loadCategories({ first: 0, rows: 20 });
  }

  confirmToggleStatus(category: Category): void {
    const action = category.active ? "desativar" : "ativar";
    this.confirmationService.confirm({
      message: `Deseja realmente ${action} a categoria "${category.name}"?`,
      header: "Confirmar",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: `Sim, ${action}`,
      rejectLabel: "Cancelar",
      accept: () => this.toggleStatus(category),
    });
  }

  toggleStatus(category: Category): void {
    this.categoryService.toggleStatus(category.id!).subscribe({
      next: () => {
        const action = category.active ? "desativada" : "ativada";
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Categoria ${action} com sucesso`,
        });
        this.loadCategories({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível alterar o status",
        });
      },
    });
  }
}
