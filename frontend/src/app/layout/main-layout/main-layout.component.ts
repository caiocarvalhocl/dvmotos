import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule
  ],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <i class="pi pi-car"></i>
            </div>
            <div class="logo-text">
              <span class="logo-title">DV</span>
              <span class="logo-subtitle">MOTOS</span>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="pi pi-home"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/clientes" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users"></i>
            <span>Clientes</span>
          </a>
          <a routerLink="/veiculos" routerLinkActive="active" class="nav-item">
            <i class="pi pi-car"></i>
            <span>Veículos</span>
          </a>
          
          <div class="nav-divider"></div>
          <span class="nav-section-title">Em breve</span>
          
          <a class="nav-item disabled">
            <i class="pi pi-box"></i>
            <span>Estoque</span>
          </a>
          <a class="nav-item disabled">
            <i class="pi pi-file-edit"></i>
            <span>Ordens de Serviço</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <p-avatar 
              [label]="getUserInitials()" 
              styleClass="user-avatar"
              shape="circle">
            </p-avatar>
            <div class="user-details">
              <span class="user-name">{{ authService.currentUser()?.nome }}</span>
              <span class="user-role">{{ authService.currentUser()?.role }}</span>
            </div>
          </div>
          <button 
            pButton 
            icon="pi pi-sign-out" 
            class="p-button-text logout-btn" 
            (click)="logout()"
            pTooltip="Sair">
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    // Variáveis de cores DV Motos
    $primary-600: #16a34a;
    $primary-700: #15803d;
    $primary-800: #166534;
    $primary-900: #14532d;
    $primary-950: #052e16;
    
    $secondary-300: #fde047;
    $secondary-400: #facc15;
    $secondary-500: #eab308;
    
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
    }
    
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, $primary-950 0%, $primary-900 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      border-right: 3px solid $secondary-400;
    }
    
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: $secondary-400;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 1.5rem;
        color: $primary-900;
      }
    }
    
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    
    .logo-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: $secondary-400;
      letter-spacing: 1px;
    }
    
    .logo-subtitle {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      letter-spacing: 3px;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
      
      &:hover:not(.disabled) {
        background: rgba(255,255,255,0.05);
        color: white;
      }
      
      &.active {
        background: rgba($secondary-400, 0.15);
        color: $secondary-400;
        border-left-color: $secondary-400;
        
        i {
          color: $secondary-400;
        }
      }
      
      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      i {
        font-size: 1.1rem;
        width: 20px;
      }
    }
    
    .nav-divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 1rem 1.5rem;
    }
    
    .nav-section-title {
      display: block;
      padding: 0.5rem 1.5rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.4);
    }
    
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0,0,0,0.2);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
      color: white;
    }
    
    .user-role {
      font-size: 0.7rem;
      color: $secondary-400;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    :host ::ng-deep .user-avatar {
      background: $secondary-400 !important;
      color: $primary-900 !important;
      font-weight: 700;
    }
    
    .logout-btn {
      color: rgba(255,255,255,0.6) !important;
      
      &:hover {
        color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.1) !important;
      }
    }
    
    .main-content {
      flex: 1;
      margin-left: 260px;
      padding: 1.5rem;
      background: #f8fafc;
      min-height: 100vh;
    }
  `]
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}

  getUserInitials(): string {
    const nome = this.authService.currentUser()?.nome || '';
    return nome.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
