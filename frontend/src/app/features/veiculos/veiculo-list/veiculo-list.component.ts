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
import { VeiculoService, Veiculo } from '../../../core/services/veiculo.service';
import { Page } from '../../../core/services/cliente.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-veiculo-list',
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
          <h1>Veículos</h1>
          <p class="text-muted">Gerencie as motos cadastradas</p>
        </div>
        <a routerLink="/veiculos/novo" pButton icon="pi pi-plus" label="Novo Veículo"></a>
      </div>
      
      <div class="card">
        <div class="table-header">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar por placa, marca ou modelo..."
              class="search-input"
            />
          </span>
        </div>
        
        <p-table 
          [value]="veiculos()" 
          [loading]="loading()"
          [paginator]="true"
          [rows]="20"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          (onLazyLoad)="loadVeiculos($event)"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} veículos"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Placa</th>
              <th>Marca/Modelo</th>
              <th>Ano</th>
              <th>Cor</th>
              <th>Cliente</th>
              <th>KM Atual</th>
              <th>Status</th>
              <th style="width: 120px">Ações</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-veiculo>
            <tr>
              <td>
                <span class="placa-badge">{{ veiculo.placa }}</span>
              </td>
              <td>
                <span class="font-bold">{{ veiculo.marca }}</span>
                <br><small class="text-muted">{{ veiculo.modelo }}</small>
              </td>
              <td>{{ veiculo.ano || '-' }}</td>
              <td>{{ veiculo.cor || '-' }}</td>
              <td>
                <a [routerLink]="['/clientes', veiculo.clienteId]" class="client-link">
                  {{ veiculo.clienteNome }}
                </a>
              </td>
              <td>{{ veiculo.kmAtual ? (veiculo.kmAtual | number:'1.0-0') + ' km' : '-' }}</td>
              <td>
                <p-tag 
                  [value]="veiculo.ativo ? 'Ativo' : 'Inativo'" 
                  [severity]="veiculo.ativo ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/veiculos', veiculo.id]" pButton icon="pi pi-pencil" class="p-button-text p-button-sm"></a>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="confirmDelete(veiculo)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-car"></i>
                  <p>Nenhum veículo encontrado</p>
                  <a routerLink="/veiculos/novo" pButton label="Cadastrar primeiro veículo" icon="pi pi-plus" class="p-button-outlined"></a>
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
    
    .placa-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f1f5f9;
      border: 2px solid #cbd5e1;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 700;
      font-size: 0.875rem;
      letter-spacing: 1px;
    }
    
    .client-link {
      color: #3b82f6;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
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
export class VeiculoListComponent implements OnInit {
  veiculos = signal<Veiculo[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  searchTerm = '';
  
  private searchSubject = new Subject<string>();

  constructor(
    private veiculoService: VeiculoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      this.loadVeiculos({ first: 0, rows: 20 });
    });
  }

  ngOnInit(): void {
    this.loadVeiculos({ first: 0, rows: 20 });
  }

  loadVeiculos(event: any): void {
    this.loading.set(true);
    const page = event.first / event.rows;
    
    this.veiculoService.findAll(page, event.rows, this.searchTerm).subscribe({
      next: (response: Page<Veiculo>) => {
        this.veiculos.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os veículos'
        });
      }
    });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  confirmDelete(veiculo: Veiculo): void {
    this.confirmationService.confirm({
      message: `Deseja realmente desativar o veículo "${veiculo.placa}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteVeiculo(veiculo)
    });
  }

  deleteVeiculo(veiculo: Veiculo): void {
    this.veiculoService.delete(veiculo.id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Veículo desativado com sucesso'
        });
        this.loadVeiculos({ first: 0, rows: 20 });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar o veículo'
        });
      }
    });
  }
}
