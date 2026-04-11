import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  ProductService,
  Product,
} from "../../../core/services/product.service";
import {
  CategoryService,
  Category,
} from "../../../core/services/category.service";
import { FormFieldComponent } from "@shared/components/form-field/form-field.component";

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    FormFieldComponent,
  ],
  providers: [MessageService],
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.scss"],
})
export class ProductFormComponent implements OnInit {
  product: Product = {
    name: "",
    salePrice: 0,
    stockQuantity: 0,
    minimumStock: 0,
    unit: "UN",
  };
  categories: Category[] = [];
  isEditing = signal(false);
  saving = signal(false);
  loading = signal(false);

  unitOptions = [
    { label: "Unidade", value: "UN" },
    { label: "Par", value: "PAR" },
    { label: "Kit", value: "KIT" },
    { label: "Litro", value: "LT" },
    { label: "Kg", value: "KG" },
    { label: "Metro", value: "MT" },
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.params["id"];
    if (id) {
      this.isEditing.set(true);
      this.loadProduct(id);
    }
  }

  loadCategories(): void {
    this.categoryService.findAllActive().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.findById(id).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Produto não encontrado",
        });
        this.loading.set(false);
        this.router.navigate(["/products"]);
      },
    });
  }

  onSubmit(): void {
    if (!this.product.name?.trim()) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Nome é obrigatório",
      });
      return;
    }
    if (!this.product.salePrice || this.product.salePrice <= 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preço de venda é obrigatório",
      });
      return;
    }

    this.saving.set(true);
    const operation = this.isEditing()
      ? this.productService.update(this.product.id!, this.product)
      : this.productService.create(this.product);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Produto ${this.isEditing() ? "atualizado" : "criado"} com sucesso`,
        });
        setTimeout(() => this.router.navigate(["/products"]), 1000);
      },
      error: (err: any) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar o produto",
        });
      },
    });
  }
}
