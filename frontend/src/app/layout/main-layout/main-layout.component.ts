import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="logo">
            <i class="pi pi-car"></i>
            DV Motos
          </h1>
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
          <button pButton icon="pi pi-sign-out" class="p-button-text p-button-danger" (click)="logout()"></button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
    }
    
    .sidebar {
      width: 260px;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
    }
    
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      margin: 0;
      
      i {
        color: #3b82f6;
      }
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255,255,255,0.05);
        color: white;
      }
      
      &.active {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        border-left: 3px solid #3b82f6;
      }
      
      i {
        font-size: 1.1rem;
      }
    }
    
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    }
    
    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    
    :host ::ng-deep .user-avatar {
      background: #3b82f6;
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
