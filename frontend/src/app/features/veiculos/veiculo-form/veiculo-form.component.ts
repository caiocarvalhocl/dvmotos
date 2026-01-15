import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { VeiculoService, Veiculo } from '../../../core/services/veiculo.service';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-veiculo-form',
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
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEditing() ? 'Editar Veículo' : 'Novo Veículo' }}</h1>
          <p class="text-muted">{{ isEditing() ? 'Atualize os dados do veículo' : 'Preencha os dados da moto' }}</p>
        </div>
        <a routerLink="/veiculos" pButton icon="pi pi-arrow-left" label="Voltar" class="p-button-outlined"></a>
      </div>
      
      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-grid">
            <!-- Proprietário -->
            <div class="form-section full-width">
              <h3><i class="pi pi-user"></i> Proprietário</h3>
              
              <div class="form-group">
                <label for="cliente">Cliente *</label>
                <p-autoComplete
                  id="cliente"
                  [(ngModel)]="selectedCliente"
                  name="cliente"
                  [suggestions]="filteredClientes()"
                  (completeMethod)="searchClientes($event)"
                  field="nome"
                  [dropdown]="true"
                  placeholder="Buscar cliente..."
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [forceSelection]="true"
                  required>
                  <ng-template let-cliente pTemplate="item">
                    <div class="cliente-item">
                      <span class="nome">{{ cliente.nome }}</span>
                      <span class="info">{{ cliente.telefone || cliente.cpfCnpj || '' }}</span>
                    </div>
                  </ng-template>
                </p-autoComplete>
              </div>
            </div>
            
            <!-- Dados do Veículo -->
            <div class="form-section">
              <h3><i class="pi pi-car"></i> Dados do Veículo</h3>
              
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="placa">Placa *</label>
                  <input 
                    pInputText 
                    id="placa" 
                    [(ngModel)]="veiculo.placa" 
                    name="placa"
                    placeholder="ABC1D23"
                    class="w-full placa-input"
                    maxlength="7"
                    required
                    (input)="formatPlaca($event)"
                  />
                </div>
                
                <div class="form-group flex-1">
                  <label for="marca">Marca *</label>
                  <p-dropdown 
                    id="marca"
                    [(ngModel)]="veiculo.marca" 
                    name="marca"
                    [options]="marcas"
                    [editable]="true"
                    placeholder="Selecione"
                    styleClass="w-full"
                    required>
                  </p-dropdown>
                </div>
                
                <div class="form-group flex-1">
                  <label for="modelo">Modelo *</label>
                  <input 
                    pInputText 
                    id="modelo" 
                    [(ngModel)]="veiculo.modelo" 
                    name="modelo"
                    placeholder="Ex: CG 160 Titan"
                    class="w-full"
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="ano">Ano</label>
                  <p-inputMask 
                    id="ano" 
                    [(ngModel)]="veiculo.ano" 
                    name="ano"
                    mask="9999"
                    placeholder="2024"
                    styleClass="w-full">
                  </p-inputMask>
                </div>
                
                <div class="form-group flex-1">
                  <label for="cor">Cor</label>
                  <p-dropdown 
                    id="cor"
                    [(ngModel)]="veiculo.cor" 
                    name="cor"
                    [options]="cores"
                    [editable]="true"
                    placeholder="Selecione"
                    styleClass="w-full">
                  </p-dropdown>
                </div>
                
                <div class="form-group flex-1">
                  <label for="kmAtual">KM Atual</label>
                  <p-inputNumber 
                    id="kmAtual" 
                    [(ngModel)]="veiculo.kmAtual" 
                    name="kmAtual"
                    [useGrouping]="true"
                    suffix=" km"
                    placeholder="0 km"
                    styleClass="w-full"
                    inputStyleClass="w-full">
                  </p-inputNumber>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="chassi">Chassi</label>
                  <input 
                    pInputText 
                    id="chassi" 
                    [(ngModel)]="veiculo.chassi" 
                    name="chassi"
                    placeholder="9BWZZZ377VT004251"
                    class="w-full"
                    maxlength="17"
                    (input)="formatChassi($event)"
                  />
                </div>
              </div>
            </div>
            
            <!-- Observações -->
            <div class="form-section full-width">
              <h3><i class="pi pi-comment"></i> Observações</h3>
              
              <div class="form-group">
                <textarea 
                  pInputTextarea 
                  id="observacoes" 
                  [(ngModel)]="veiculo.observacoes" 
                  name="observacoes"
                  [rows]="3"
                  placeholder="Observações sobre o veículo..."
                  class="w-full">
                </textarea>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <a routerLink="/veiculos" pButton label="Cancelar" class="p-button-outlined p-button-secondary"></a>
            <button 
              pButton 
              type="submit" 
              [label]="isEditing() ? 'Salvar Alterações' : 'Cadastrar Veículo'" 
              icon="pi pi-check"
              [loading]="saving()"
              [disabled]="!form.valid || !selectedCliente">
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      
      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.25rem;
      }
      
      p {
        margin: 0;
      }
    }
    
    .form-grid {
      display: grid;
      gap: 1.5rem;
    }
    
    .form-section {
      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
        margin: 0 0 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i {
          color: #3b82f6;
        }
      }
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .form-group {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
      }
    }
    
    .flex-1 { flex: 1; }
    .full-width { grid-column: 1 / -1; }
    
    .placa-input {
      text-transform: uppercase;
      font-family: monospace;
      font-size: 1rem;
      letter-spacing: 2px;
    }
    
    .cliente-item {
      display: flex;
      flex-direction: column;
      
      .nome {
        font-weight: 500;
      }
      
      .info {
        font-size: 0.75rem;
        color: #64748b;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    
    :host ::ng-deep {
      .p-autocomplete, .p-dropdown, .p-inputmask, .p-inputnumber {
        width: 100%;
      }
    }
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class VeiculoFormComponent implements OnInit {
  veiculo: Veiculo = {
    clienteId: 0,
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
    chassi: '',
    kmAtual: undefined,
    observacoes: ''
  };
  
  selectedCliente: Cliente | null = null;
  filteredClientes = signal<Cliente[]>([]);
  
  isEditing = signal(false);
  saving = signal(false);
  
  marcas = [
    'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'BMW', 
    'Ducati', 'Harley-Davidson', 'Triumph', 'KTM', 
    'Dafra', 'Shineray', 'Haojue', 'Outra'
  ];
  
  cores = [
    'Preto', 'Branco', 'Prata', 'Vermelho', 'Azul', 
    'Verde', 'Amarelo', 'Laranja', 'Cinza', 'Marrom'
  ];

  constructor(
    private veiculoService: VeiculoService,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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
          }
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Veículo não encontrado'
        });
        this.router.navigate(['/veiculos']);
      }
    });
  }

  searchClientes(event: any): void {
    this.clienteService.findAll(0, 10, event.query).subscribe({
      next: (response) => {
        this.filteredClientes.set(response.content);
      }
    });
  }

  formatPlaca(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 7) value = value.substring(0, 7);
    this.veiculo.placa = value;
    event.target.value = value;
  }

  formatChassi(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 17) value = value.substring(0, 17);
    this.veiculo.chassi = value;
    event.target.value = value;
  }

  onSubmit(): void {
    if (!this.selectedCliente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um cliente'
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
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditing() ? 'Veículo atualizado!' : 'Veículo cadastrado!'
        });
        setTimeout(() => this.router.navigate(['/veiculos']), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Não foi possível salvar o veículo'
        });
      }
    });
  }
}
