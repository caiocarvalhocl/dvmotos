import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputMaskModule } from "primeng/inputmask";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { ClientService, Client } from "../../../core/services/client.service";

@Component({
  selector: "app-client-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputMaskModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./client-form.component.html",
  styleUrls: ["./client-form.component.scss"],
})
export class ClientFormComponent implements OnInit {
  client: Client = {
    name: "",
    documentNumber: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  };
  isEditing = signal(false);
  saving = signal(false);
  documentMask = "999.999.999-99";
  states = [
    { label: "AC", value: "AC" },
    { label: "AL", value: "AL" },
    { label: "AP", value: "AP" },
    { label: "AM", value: "AM" },
    { label: "BA", value: "BA" },
    { label: "CE", value: "CE" },
    { label: "DF", value: "DF" },
    { label: "ES", value: "ES" },
    { label: "GO", value: "GO" },
    { label: "MA", value: "MA" },
    { label: "MT", value: "MT" },
    { label: "MS", value: "MS" },
    { label: "MG", value: "MG" },
    { label: "PA", value: "PA" },
    { label: "PB", value: "PB" },
    { label: "PR", value: "PR" },
    { label: "PE", value: "PE" },
    { label: "PI", value: "PI" },
    { label: "RJ", value: "RJ" },
    { label: "RN", value: "RN" },
    { label: "RS", value: "RS" },
    { label: "RO", value: "RO" },
    { label: "RR", value: "RR" },
    { label: "SC", value: "SC" },
    { label: "SP", value: "SP" },
    { label: "SE", value: "SE" },
    { label: "TO", value: "TO" },
  ];

  constructor(
    private clientService: ClientService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing.set(true);
      this.loadClient(+id);
    }
  }

  loadClient(id: number): void {
    this.clientService.findById(id).subscribe({
      next: (client) => {
        this.client = client;
        this.updateDocumentMask();
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Cliente não encontrado",
        });
        this.router.navigate(["/clients"]);
      },
    });
  }

  updateDocumentMask(): void {
    this.documentMask =
      this.client.documentNumber && this.client.documentNumber.length > 14
        ? "99.999.999/9999-99"
        : "999.999.999-99";
  }

  onSubmit(): void {
    this.saving.set(true);
    const operation = this.isEditing()
      ? this.clientService.update(this.client.id!, this.client)
      : this.clientService.create(this.client);
    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing()
            ? "Cliente atualizado!"
            : "Cliente cadastrado!",
        });
        setTimeout(() => this.router.navigate(["/clients"]), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar o cliente",
        });
      },
    });
  }
}
