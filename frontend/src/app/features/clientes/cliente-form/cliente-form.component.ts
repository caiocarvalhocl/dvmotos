import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClienteService, Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-cliente-form',
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
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEditing() ? 'Editar Cliente' : 'Novo Cliente' }}</h1>
          <p class="text-muted">{{ isEditing() ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente' }}</p>
        </div>
        <a routerLink="/clientes" pButton icon="pi pi-arrow-left" label="Voltar" class="p-button-outlined"></a>
      </div>
      
      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-grid">
            <!-- Dados Pessoais -->
            <div class="form-section">
              <h3><i class="pi pi-user"></i> Dados Pessoais</h3>
              
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="nome">Nome *</label>
                  <input 
                    pInputText 
                    id="nome" 
                    [(ngModel)]="cliente.nome" 
                    name="nome"
                    placeholder="Nome completo"
                    class="w-full"
                    required
                  />
                </div>
                
                <div class="form-group flex-1">
                  <label for="cpfCnpj">CPF/CNPJ</label>
                  <p-inputMask 
                    id="cpfCnpj" 
                    [(ngModel)]="cliente.cpfCnpj" 
                    name="cpfCnpj"
                    [mask]="cpfCnpjMask"
                    placeholder="000.000.000-00"
                    styleClass="w-full">
                  </p-inputMask>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="telefone">Telefone</label>
                  <p-inputMask 
                    id="telefone" 
                    [(ngModel)]="cliente.telefone" 
                    name="telefone"
                    mask="(99) 99999-9999"
                    placeholder="(00) 00000-0000"
                    styleClass="w-full">
                  </p-inputMask>
                </div>
                
                <div class="form-group flex-1">
                  <label for="email">E-mail</label>
                  <input 
                    pInputText 
                    id="email" 
                    type="email"
                    [(ngModel)]="cliente.email" 
                    name="email"
                    placeholder="email@exemplo.com"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
            
            <!-- Endereço -->
            <div class="form-section">
              <h3><i class="pi pi-map-marker"></i> Endereço</h3>
              
              <div class="form-row">
                <div class="form-group flex-1">
                  <label for="cep">CEP</label>
                  <p-inputMask 
                    id="cep" 
                    [(ngModel)]="cliente.cep" 
                    name="cep"
                    mask="99999-999"
                    placeholder="00000-000"
                    styleClass="w-full">
                  </p-inputMask>
                </div>
                
                <div class="form-group flex-3">
                  <label for="endereco">Endereço</label>
                  <input 
                    pInputText 
                    id="endereco" 
                    [(ngModel)]="cliente.endereco" 
                    name="endereco"
                    placeholder="Rua, número, bairro"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="cidade">Cidade</label>
                  <input 
                    pInputText 
                    id="cidade" 
                    [(ngModel)]="cliente.cidade" 
                    name="cidade"
                    placeholder="Cidade"
                    class="w-full"
                  />
                </div>
                
                <div class="form-group flex-1">
                  <label for="estado">Estado</label>
                  <p-dropdown 
                    id="estado"
                    [(ngModel)]="cliente.estado" 
                    name="estado"
                    [options]="estados"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="UF"
                    styleClass="w-full">
                  </p-dropdown>
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
                  [(ngModel)]="cliente.observacoes" 
                  name="observacoes"
                  [rows]="3"
                  placeholder="Observações sobre o cliente..."
                  class="w-full">
                </textarea>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <a routerLink="/clientes" pButton label="Cancelar" class="p-button-outlined p-button-secondary"></a>
            <button 
              pButton 
              type="submit" 
              [label]="isEditing() ? 'Salvar Alterações' : 'Cadastrar Cliente'" 
              icon="pi pi-check"
              [loading]="saving()"
              [disabled]="!form.valid">
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
    .flex-2 { flex: 2; }
    .flex-3 { flex: 3; }
    .full-width { grid-column: 1 / -1; }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    
    :host ::ng-deep {
      .p-inputmask, .p-dropdown {
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
export class ClienteFormComponent implements OnInit {
  cliente: Cliente = {
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  };
  
  isEditing = signal(false);
  saving = signal(false);
  cpfCnpjMask = '999.999.999-99';
  
  estados = [
    { label: 'AC', value: 'AC' }, { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' }, { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' }, { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' }, { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' }, { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' }, { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' }, { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' }, { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' }, { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' }, { label: 'RN', value: 'RN' },
    { label: 'RS', value: 'RS' }, { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' }, { label: 'SC', value: 'SC' },
    { label: 'SP', value: 'SP' }, { label: 'SE', value: 'SE' },
    { label: 'TO', value: 'TO' }
  ];

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadCliente(+id);
    }
  }

  loadCliente(id: number): void {
    this.clienteService.findById(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.updateCpfMask();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Cliente não encontrado'
        });
        this.router.navigate(['/clientes']);
      }
    });
  }

  updateCpfMask(): void {
    if (this.cliente.cpfCnpj && this.cliente.cpfCnpj.length > 14) {
      this.cpfCnpjMask = '99.999.999/9999-99';
    } else {
      this.cpfCnpjMask = '999.999.999-99';
    }
  }

  onSubmit(): void {
    this.saving.set(true);
    
    const operation = this.isEditing()
      ? this.clienteService.update(this.cliente.id!, this.cliente)
      : this.clienteService.create(this.cliente);
    
    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditing() ? 'Cliente atualizado!' : 'Cliente cadastrado!'
        });
        setTimeout(() => this.router.navigate(['/clientes']), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Não foi possível salvar o cliente'
        });
      }
    });
  }
}
