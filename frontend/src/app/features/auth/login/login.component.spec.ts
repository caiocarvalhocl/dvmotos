import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.email).toBe('');
    expect(component.credentials.password).toBe('');
  });

  it('should initialize with loading false and no error', () => {
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should navigate to dashboard on successful login', () => {
    authService.login.and.returnValue(of({ token: 't', refreshToken: 'r', type: 'Bearer', expiresIn: 3600, user: {} as any }));

    component.credentials = { email: 'test@test.com', password: '123456' };
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: '123456' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set loading true during login', () => {
    authService.login.and.returnValue(of({ token: 't', refreshToken: 'r', type: 'Bearer', expiresIn: 3600, user: {} as any }));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
  });

  it('should set error on login failure', () => {
    authService.login.and.returnValue(throwError(() => ({ error: { message: 'Credenciais inválidas' } })));

    component.onSubmit();

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('Credenciais inválidas');
  });

  it('should set default error message when no message in error', () => {
    authService.login.and.returnValue(throwError(() => ({ error: {} })));

    component.onSubmit();

    expect(component.error()).toBe('E-mail ou senha incorretos');
  });
});
