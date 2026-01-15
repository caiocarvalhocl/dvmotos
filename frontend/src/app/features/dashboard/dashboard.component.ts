import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  template: `
    <div class="dashboard">
      <div class="welcome-section">
        <h1 *ngdIf="authService.currentUser() as user">
          Bem-vindo, {{ user.nome.split(" ")[0] }}! 👋
        </h1>
        <p>Aqui está o resumo do seu sistema.</p>
      </div>

      <div class="quick-actions">
        <h2>Acesso Rápido</h2>
        <div class="actions-grid">
          <a routerLink="/clientes/novo" class="action-card">
            <div class="action-icon" style="background: #dbeafe;">
              <i class="pi pi-user-plus" style="color: #3b82f6;"></i>
            </div>
            <div class="action-content">
              <h3>Novo Cliente</h3>
              <p>Cadastrar cliente</p>
            </div>
          </a>

          <a routerLink="/veiculos/novo" class="action-card">
            <div class="action-icon" style="background: #dcfce7;">
              <i class="pi pi-car" style="color: #22c55e;"></i>
            </div>
            <div class="action-content">
              <h3>Novo Veículo</h3>
              <p>Cadastrar moto</p>
            </div>
          </a>

          <a routerLink="/clientes" class="action-card">
            <div class="action-icon" style="background: #fef3c7;">
              <i class="pi pi-users" style="color: #f59e0b;"></i>
            </div>
            <div class="action-content">
              <h3>Clientes</h3>
              <p>Ver todos os clientes</p>
            </div>
          </a>

          <a routerLink="/veiculos" class="action-card">
            <div class="action-icon" style="background: #f3e8ff;">
              <i class="pi pi-list" style="color: #a855f7;"></i>
            </div>
            <div class="action-content">
              <h3>Veículos</h3>
              <p>Ver todos os veículos</p>
            </div>
          </a>
        </div>
      </div>

      <div class="info-section">
        <div class="info-card">
          <i class="pi pi-info-circle"></i>
          <div>
            <h4>MVP em Desenvolvimento</h4>
            <p>
              Estamos trabalhando para trazer mais funcionalidades em breve:
              Estoque, Ordens de Serviço, Relatórios e muito mais!
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-section {
        margin-bottom: 2rem;

        h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem;
        }

        p {
          color: #64748b;
          margin: 0;
        }
      }

      .quick-actions {
        margin-bottom: 2rem;

        h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 1rem;
        }
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .action-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        background: white;
        border-radius: 12px;
        text-decoration: none;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      }

      .action-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 1.25rem;
        }
      }

      .action-content {
        h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem;
        }

        p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }
      }

      .info-section {
        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: #eff6ff;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;

          i {
            font-size: 1.25rem;
            color: #3b82f6;
            margin-top: 2px;
          }

          h4 {
            font-size: 1rem;
            font-weight: 600;
            color: #1e40af;
            margin: 0 0 0.5rem;
          }

          p {
            font-size: 0.875rem;
            color: #1e40af;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    `,
  ],
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
