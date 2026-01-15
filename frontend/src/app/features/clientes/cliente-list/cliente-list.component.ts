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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClienteService, Cliente, Page } from '../../../core/services/cliente.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-cliente-list',
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
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Clientes</h1>
          <p class="text-muted">Gerencie os clientes da oficina</p>
        </div>
        <a routerLink="/clientes/novo" pButton icon="pi pi-plus" label="Novo Cliente"></a>
      </div>
      
      <div class="card">
        <div class="table-header">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar por nome, CPF ou telefone..."
              class="search-input"
            />
          </span>
        </div>
        
        <p-table 
          [value]="clientes()" 
          [loading]="loading()"
          [paginator]="true"
          [rows]="20"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="loadClientes($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>Veículos</th>
              <th>Status</th>
              <th style="width: 120px">Ações</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-cliente>
            <tr>
              <td>
                <span class="font-bold">{{ cliente.nome }}</span>
                @if (cliente.email) {
                  <br><small class="text-muted">{{ cliente.email }}</small>
                }
              </td>
              <td>{{ cliente.cpfCnpj || '-' }}</td>
              <td>{{ cliente.telefone || '-' }}</td>
              <td>{{ cliente.cidade ? cliente.cidade + '/' + cliente.estado : '-' }}</td>
              <td>
                <span class="veiculos-badge">{{ cliente.totalVeiculos || 0 }}</span>
              </td>
              <td>
                <p-tag 
                  [value]="cliente.ativo ? 'Ativo' : 'Inativo'" 
                  [severity]="cliente.ativo ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/clientes', cliente.id]" pButton icon="pi pi-pencil" class="p-button-text p-button-sm"></a>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="confirmDelete(cliente)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-users"></i>
                  <p>Nenhum cliente encontrado</p>
                  <a routerLink="/clientes/novo" pButton label="Cadastrar primeiro cliente" icon="pi pi-plus" class="p-button-outlined"></a>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
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
    
    .veiculos-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #e0e7ff;
      color: #4f46e5;
      border-radius: 50%;
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
  `]
})
export class ClienteListComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = '';
  
  private searchSubject = new Subject<string>();

  constructor(
    private clienteService: ClienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      this.loadClientes({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadClientes({ first: 0, rows: 20 });
  }

  loadClientes(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    
    this.clienteService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Cliente>) => {
        this.clientes.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os clientes'
        });
      }
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  confirmDelete(cliente: Cliente): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o cliente "${cliente.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteCliente(cliente)
    });
  }

  deleteCliente(cliente: Cliente): void {
    this.clienteService.delete(cliente.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cliente desativado com sucesso'
        });
        this.loadClientes({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar o cliente'
        });
      }
    });
  }
}
