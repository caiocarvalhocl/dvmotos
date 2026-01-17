import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
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
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
      },
      {
        path: 'vehicles/new',
        loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
      },
      {
        path: 'vehicles/:id',
        loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
