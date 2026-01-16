import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { UsuarioService, Usuario } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-form',
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
    MessageModule
  ],
  providers: [MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEditing() ? 'Editar Usuário' : 'Novo Usuário' }}</h1>
          <p class="text-muted">{{ isEditing() ? 'Atualize os dados do usuário' : 'Preencha os dados do novo usuário' }}</p>
        </div>
        <a routerLink="/usuarios" pButton icon="pi pi-arrow-left" label="Voltar" class="p-button-outlined"></a>
      </div>
      
      <div class="card">
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="form-grid">
            <!-- Dados do Usuário -->
            <div class="form-section">
              <h3><i class="pi pi-user"></i> Dados do Usuário</h3>
              
              <div class="form-group">
                <label for="nome">Nome Completo *</label>
                <input 
                  pInputText 
                  id="nome" 
                  [(ngModel)]="usuario.nome" 
                  name="nome"
                  placeholder="Nome completo"
                  class="w-full"
                  required
                  minlength="3"
                />
              </div>
              
              <div class="form-group">
                <label for="email">E-mail *</label>
                <input 
                  pInputText 
                  id="email" 
                  type="email"
                  [(ngModel)]="usuario.email" 
                  name="email"
                  placeholder="email@exemplo.com"
                  class="w-full"
                  required
                  email
                />
              </div>
              
              <div class="form-group">
                <label for="role">Perfil de Acesso *</label>
                <p-dropdown 
                  id="role"
                  [(ngModel)]="usuario.role" 
                  name="role"
                  [options]="roles"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione o perfil"
                  styleClass="w-full"
                  required>
                </p-dropdown>
              </div>
            </div>
            
            <!-- Senha -->
            <div class="form-section">
              <h3><i class="pi pi-lock"></i> Senha</h3>
              
              @if (isEditing()) {
                <p-message severity="info" text="Deixe em branco para manter a senha atual"></p-message>
              }
              
              <div class="form-group" [class.mt-3]="isEditing()">
                <label for="senha">{{ isEditing() ? 'Nova Senha' : 'Senha *' }}</label>
                <p-password 
                  id="senha" 
                  [(ngModel)]="usuario.senha" 
                  name="senha"
                  [toggleMask]="true"
                  [feedback]="true"
                  placeholder="Mínimo 6 caracteres"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [required]="!isEditing()"
                  minlength="6">
                </p-password>
              </div>
              
              <div class="form-group">
                <label for="confirmarSenha">{{ isEditing() ? 'Confirmar Nova Senha' : 'Confirmar Senha *' }}</label>
                <p-password 
                  id="confirmarSenha" 
                  [(ngModel)]="confirmarSenha" 
                  name="confirmarSenha"
                  [toggleMask]="true"
                  [feedback]="false"
                  placeholder="Repita a senha"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [required]="!isEditing() || !!usuario.senha">
                </p-password>
                @if (usuario.senha && confirmarSenha && usuario.senha !== confirmarSenha) {
                  <small class="text-danger">As senhas não conferem</small>
                }
              </div>
            </div>
            
            <!-- Info de Perfis -->
            <div class="form-section info-section">
              <h3><i class="pi pi-info-circle"></i> Sobre os Perfis</h3>
              
              <div class="role-info">
                <div class="role-card">
                  <div class="role-header admin">
                    <i class="pi pi-shield"></i>
                    <span>Administrador</span>
                  </div>
                  <p>Acesso total ao sistema, incluindo gestão de usuários e configurações.</p>
                </div>
                
                <div class="role-card">
                  <div class="role-header operador">
                    <i class="pi pi-user"></i>
                    <span>Operador</span>
                  </div>
                  <p>Acesso às operações do dia-a-dia: clientes, veículos, ordens de serviço e estoque.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <a routerLink="/usuarios" pButton label="Cancelar" class="p-button-outlined p-button-secondary"></a>
            <button 
              pButton 
              type="submit" 
              [label]="isEditing() ? 'Salvar Alterações' : 'Cadastrar Usuário'" 
              icon="pi pi-check"
              [loading]="saving()"
              [disabled]="!form.valid || (usuario.senha && usuario.senha !== confirmarSenha)">
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
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
          color: #16a34a;
        }
      }
    }
    
    .form-group {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
      }
    }
    
    .text-danger {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .info-section {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    
    .role-info {
      display: grid;
      gap: 1rem;
    }
    
    .role-card {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      
      p {
        margin: 0;
        color: #64748b;
        font-size: 0.875rem;
      }
    }
    
    .role-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      
      &.admin {
        color: #d97706;
        
        i {
          color: #d97706;
        }
      }
      
      &.operador {
        color: #3b82f6;
        
        i {
          color: #3b82f6;
        }
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
      .p-password, .p-dropdown {
        width: 100%;
      }
    }
  `]
})
export class UsuarioFormComponent implements OnInit {
  usuario: Usuario = {
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR'
  };
  
  confirmarSenha = '';
  isEditing = signal(false);
  saving = signal(false);
  
  roles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Operador', value: 'OPERADOR' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadUsuario(+id);
    }
  }

  loadUsuario(id: number): void {
    this.usuarioService.findById(id).subscribe({
      next: (usuario) => {
        this.usuario = { ...usuario, senha: '' };
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Usuário não encontrado'
        });
        this.router.navigate(['/usuarios']);
      }
    });
  }

  onSubmit(): void {
    // Validação de senha
    if (this.usuario.senha && this.usuario.senha !== this.confirmarSenha) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'As senhas não conferem'
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
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditing() ? 'Usuário atualizado!' : 'Usuário cadastrado!'
        });
        setTimeout(() => this.router.navigate(['/usuarios']), 1500);
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Não foi possível salvar o usuário'
        });
      }
    });
  }
}
