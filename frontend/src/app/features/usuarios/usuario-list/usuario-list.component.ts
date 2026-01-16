import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioService, Usuario, Page } from '../../../core/services/usuario.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    PasswordModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Usuários</h1>
          <p class="text-muted">Gerencie os usuários do sistema</p>
        </div>
        <a routerLink="/usuarios/novo" pButton icon="pi pi-plus" label="Novo Usuário"></a>
      </div>
      
      <div class="card">
        <div class="table-header">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar por nome ou e-mail..."
              class="search-input"
            />
          </span>
        </div>
        
        <p-table 
          [value]="usuarios()" 
          [loading]="loading()"
          [paginator]="true"
          [rows]="20"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="loadUsuarios($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Criado em</th>
              <th style="width: 150px">Ações</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-usuario>
            <tr>
              <td>
                <div class="user-info">
                  <div class="user-avatar">{{ getInitials(usuario.nome) }}</div>
                  <span class="font-bold">{{ usuario.nome }}</span>
                </div>
              </td>
              <td>{{ usuario.email }}</td>
              <td>
                <p-tag 
                  [value]="usuario.role === 'ADMIN' ? 'Administrador' : 'Operador'" 
                  [severity]="usuario.role === 'ADMIN' ? 'warning' : 'info'">
                </p-tag>
              </td>
              <td>
                <p-tag 
                  [value]="usuario.ativo ? 'Ativo' : 'Inativo'" 
                  [severity]="usuario.ativo ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>{{ usuario.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    pButton 
                    icon="pi pi-key" 
                    class="p-button-text p-button-sm p-button-warning" 
                    (click)="openPasswordDialog(usuario)"
                    pTooltip="Alterar senha">
                  </button>
                  <a 
                    [routerLink]="['/usuarios', usuario.id]" 
                    pButton 
                    icon="pi pi-pencil" 
                    class="p-button-text p-button-sm"
                    pTooltip="Editar">
                  </a>
                  @if (usuario.ativo) {
                    <button 
                      pButton 
                      icon="pi pi-trash" 
                      class="p-button-text p-button-danger p-button-sm" 
                      (click)="confirmDelete(usuario)"
                      pTooltip="Desativar">
                    </button>
                  } @else {
                    <button 
                      pButton 
                      icon="pi pi-check-circle" 
                      class="p-button-text p-button-success p-button-sm" 
                      (click)="activate(usuario)"
                      pTooltip="Reativar">
                    </button>
                  }
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-users"></i>
                  <p>Nenhum usuário encontrado</p>
                  <a routerLink="/usuarios/novo" pButton label="Cadastrar primeiro usuário" icon="pi pi-plus" class="p-button-outlined"></a>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    
    <!-- Dialog de alteração de senha -->
    <p-dialog 
      header="Alterar Senha" 
      [(visible)]="showPasswordDialog" 
      [modal]="true" 
      [style]="{width: '400px'}">
      <div class="password-dialog-content">
        <p>Alterar senha do usuário: <strong>{{ selectedUsuario?.nome }}</strong></p>
        
        <div class="form-group">
          <label for="novaSenha">Nova Senha</label>
          <p-password 
            id="novaSenha" 
            [(ngModel)]="novaSenha" 
            [toggleMask]="true"
            [feedback]="true"
            placeholder="Mínimo 6 caracteres"
            styleClass="w-full"
            inputStyleClass="w-full">
          </p-password>
        </div>
        
        <div class="form-group">
          <label for="confirmarSenha">Confirmar Senha</label>
          <p-password 
            id="confirmarSenha" 
            [(ngModel)]="confirmarSenha" 
            [toggleMask]="true"
            [feedback]="false"
            placeholder="Repita a senha"
            styleClass="w-full"
            inputStyleClass="w-full">
          </p-password>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="showPasswordDialog = false"></button>
        <button 
          pButton 
          label="Salvar" 
          icon="pi pi-check" 
          (click)="changePassword()"
          [disabled]="!novaSenha || novaSenha.length < 6 || novaSenha !== confirmarSenha">
        </button>
      </ng-template>
    </p-dialog>
    
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
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
    
    .table-header {
      margin-bottom: 1rem;
    }
    
    .search-input {
      width: 350px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }
    
    .empty-state {
      padding: 3rem;
      
      i {
        font-size: 3rem;
        color: #cbd5e1;
        margin-bottom: 1rem;
      }
      
      p {
        color: #64748b;
        margin-bottom: 1rem;
      }
    }
    
    .password-dialog-content {
      p {
        margin-bottom: 1.5rem;
        color: #64748b;
      }
      
      .form-group {
        margin-bottom: 1rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
      }
    }
  `]
})
export class UsuarioListComponent implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = '';
  
  // Dialog de senha
  showPasswordDialog = false;
  selectedUsuario: Usuario | null = null;
  novaSenha = '';
  confirmarSenha = '';
  
  private searchSubject = new Subject<string>();

  constructor(
    private usuarioService: UsuarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.loadUsuarios({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadUsuarios({ first: 0, rows: 20 });
  }

  loadUsuarios(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    
    this.usuarioService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Usuario>) => {
        this.usuarios.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os usuários'
        });
      }
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  confirmDelete(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o usuário "${usuario.nome}"?`,
      header: 'Confirmar Desativação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      accept: () => this.delete(usuario)
    });
  }

  delete(usuario: Usuario): void {
    this.usuarioService.delete(usuario.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário desativado'
        });
        this.loadUsuarios({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar o usuário'
        });
      }
    });
  }

  activate(usuario: Usuario): void {
    this.usuarioService.activate(usuario.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário reativado'
        });
        this.loadUsuarios({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível reativar o usuário'
        });
      }
    });
  }

  openPasswordDialog(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.showPasswordDialog = true;
  }

  changePassword(): void {
    if (!this.selectedUsuario || !this.novaSenha || this.novaSenha !== this.confirmarSenha) {
      return;
    }

    this.usuarioService.changePassword(this.selectedUsuario.id!, this.novaSenha).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Senha alterada com sucesso'
        });
        this.showPasswordDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível alterar a senha'
        });
      }
    });
  }
}
