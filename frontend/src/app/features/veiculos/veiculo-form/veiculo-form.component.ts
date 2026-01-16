import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import {
  VeiculoService,
  Veiculo,
} from "../../../core/services/veiculo.service";
import {
  ClienteService,
  Cliente,
} from "../../../core/services/cliente.service";

@Component({
  selector: "app-veiculo-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    InputMaskModule,
    InputNumberModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModule,
    AutoCompleteModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./veiculo-form.component.html",
  styleUrls: ["./veiculo-form.component.scss"],
})
export class VeiculoFormComponent implements OnInit {
  veiculo: Veiculo = {
    clienteId: 0,
    placa: "",
    marca: "",
    modelo: "",
    ano: "",
    cor: "",
    chassi: "",
    kmAtual: undefined,
    observacoes: "",
  };

  selectedCliente: Cliente | null = null;
  filteredClientes = signal<Cliente[]>([]);

  isEditing = signal(false);
  saving = signal(false);

  marcas = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "BMW",
    "Ducati",
    "Harley-Davidson",
    "Triumph",
    "KTM",
    "Dafra",
    "Shineray",
    "Haojue",
    "Outra",
  ];

  cores = [
    "Preto",
    "Branco",
    "Prata",
    "Vermelho",
    "Azul",
    "Verde",
    "Amarelo",
    "Laranja",
    "Cinza",
    "Marrom",
  ];

  constructor(
    private veiculoService: VeiculoService,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing.set(true);
      this.loadVeiculo(+id);
    }
  }

  loadVeiculo(id: number): void {
    this.veiculoService.findById(id).subscribe({
      next: (veiculo) => {
        this.veiculo = veiculo;
        // Carregar cliente
        this.clienteService.findById(veiculo.clienteId).subscribe({
          next: (cliente) => {
            this.selectedCliente = cliente;
          },
        });
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Veículo não encontrado",
        });
        this.router.navigate(["/veiculos"]);
      },
    });
  }

  searchClientes(event: any): void {
    this.clienteService.findAll(0, 10, event.query).subscribe({
      next: (response) => {
        this.filteredClientes.set(response.content);
      },
    });
  }

  formatPlaca(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 7) value = value.substring(0, 7);
    this.veiculo.placa = value;
    event.target.value = value;
  }

  formatChassi(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 17) value = value.substring(0, 17);
    this.veiculo.chassi = value;
    event.target.value = value;
  }

  onSubmit(): void {
    if (!this.selectedCliente) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Selecione um cliente",
      });
      return;
    }

    this.saving.set(true);
    this.veiculo.clienteId = this.selectedCliente.id!;

    const operation = this.isEditing()
      ? this.veiculoService.update(this.veiculo.id!, this.veiculo)
      : this.veiculoService.create(this.veiculo);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: this.isEditing()
            ? "Veículo atualizado!"
            : "Veículo cadastrado!",
        });
        setTimeout(() => this.router.navigate(["/veiculos"]), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Não foi possível salvar o veículo",
        });
      },
    });
  }
}
