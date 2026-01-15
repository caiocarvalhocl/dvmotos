import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <i class="pi pi-car"></i>
          </div>
          <h1>DV Motos</h1>
          <p>Sistema de Gestão</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="login-form">
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="mb-3 w-full"></p-message>
          }
          
          <div class="form-group">
            <label for="email">E-mail</label>
            <input 
              pInputText 
              id="email" 
              type="email" 
              [(ngModel)]="credentials.email"
              name="email"
              placeholder="seu@email.com"
              class="w-full"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="senha">Senha</label>
            <p-password 
              id="senha" 
              [(ngModel)]="credentials.senha"
              name="senha"
              [feedback]="false"
              [toggleMask]="true"
              placeholder="Sua senha"
              styleClass="w-full"
              inputStyleClass="w-full"
              required>
            </p-password>
          </div>
          
          <button 
            pButton 
            type="submit" 
            label="Entrar" 
            icon="pi pi-sign-in"
            class="w-full"
            [loading]="loading()">
          </button>
        </form>
        
        <div class="login-footer">
          <small>Usuário padrão: admin&#64;dvmotos.com.br / admin123</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 1rem;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      
      .logo {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        
        i {
          font-size: 2rem;
          color: white;
        }
      }
      
      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.25rem;
      }
      
      p {
        color: #64748b;
        margin: 0;
      }
    }
    
    .login-form {
      .form-group {
        margin-bottom: 1.25rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
      }
    }
    
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      
      small {
        color: #94a3b8;
      }
    }
    
    :host ::ng-deep {
      .p-inputtext {
        width: 100%;
      }
      
      .p-password {
        width: 100%;
        
        input {
          width: 100%;
        }
      }
      
      .p-button {
        justify-content: center;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    senha: ''
  };
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'E-mail ou senha incorretos');
      }
    });
  }
}
