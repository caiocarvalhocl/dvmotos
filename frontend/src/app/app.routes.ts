import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/cliente-list/cliente-list.component').then(m => m.ClienteListComponent)
      },
      {
        path: 'clientes/novo',
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id',
        loadComponent: () => import('./features/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'veiculos',
        loadComponent: () => import('./features/veiculos/veiculo-list/veiculo-list.component').then(m => m.VeiculoListComponent)
      },
      {
        path: 'veiculos/novo',
        loadComponent: () => import('./features/veiculos/veiculo-form/veiculo-form.component').then(m => m.VeiculoFormComponent)
      },
      {
        path: 'veiculos/:id',
        loadComponent: () => import('./features/veiculos/veiculo-form/veiculo-form.component').then(m => m.VeiculoFormComponent)
      },
      // Usuários (apenas admin)
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
      },
      {
        path: 'usuarios/novo',
        loadComponent: () => import('./features/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
