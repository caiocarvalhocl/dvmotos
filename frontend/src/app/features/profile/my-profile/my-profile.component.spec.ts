import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyProfileComponent } from './my-profile.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError, signal } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MyProfileComponent', () => {
  let component: MyProfileComponent;
  let fixture: ComponentFixture<MyProfileComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let authServiceMock: any;

  const mockUser = { id: 1, name: 'João Silva', email: 'joao@test.com', role: 'ADMIN' as const, active: true };

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['getMyProfile', 'updateMyProfile', 'changeMyPassword']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    authServiceMock = {
      currentUser: jasmine.createSpy('currentUser').and.returnValue(mockUser),
      isAdmin: signal(true),
      isAuthenticated: signal(true)
    };

    userService.getMyProfile.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [MyProfileComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    component.ngOnInit();
    expect(userService.getMyProfile).toHaveBeenCalled();
    expect(component.user.name).toBe('João Silva');
    expect(component.loading()).toBeFalse();
  });

  it('should handle profile load error', () => {
    userService.getMyProfile.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  describe('onSaveProfile', () => {
    beforeEach(() => component.ngOnInit());

    it('should warn if name or email empty', () => {
      component.user.name = '';
      component.onSaveProfile();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });

    it('should update profile', () => {
      userService.updateMyProfile.and.returnValue(of(mockUser));
      component.onSaveProfile();
      expect(userService.updateMyProfile).toHaveBeenCalledWith({ name: 'João Silva', email: 'joao@test.com' });
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
      expect(component.savingProfile()).toBeFalse();
    });

    it('should handle update error', () => {
      userService.updateMyProfile.and.returnValue(throwError(() => ({ error: { message: 'Email duplicado' } })));
      component.onSaveProfile();
      expect(component.savingProfile()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });
  });

  describe('onChangePassword', () => {
    beforeEach(() => component.ngOnInit());

    it('should warn if fields empty', () => {
      component.onChangePassword();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });

    it('should warn if password too short', () => {
      component.currentPassword = 'old';
      component.newPassword = '123';
      component.confirmPassword = '123';
      component.onChangePassword();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'A nova senha deve ter pelo menos 6 caracteres' }));
    });

    it('should warn if passwords do not match', () => {
      component.currentPassword = 'old123';
      component.newPassword = 'new123';
      component.confirmPassword = 'different';
      component.onChangePassword();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'A nova senha e a confirmação não coincidem' }));
    });

    it('should change password successfully', () => {
      userService.changeMyPassword.and.returnValue(of({}));
      component.currentPassword = 'old123';
      component.newPassword = 'new123';
      component.confirmPassword = 'new123';
      component.onChangePassword();

      expect(userService.changeMyPassword).toHaveBeenCalledWith({ currentPassword: 'old123', newPassword: 'new123' });
      expect(component.currentPassword).toBe('');
      expect(component.newPassword).toBe('');
      expect(component.confirmPassword).toBe('');
      expect(component.savingPassword()).toBeFalse();
    });

    it('should handle change password error', () => {
      userService.changeMyPassword.and.returnValue(throwError(() => ({ error: { message: 'Senha atual incorreta' } })));
      component.currentPassword = 'wrong';
      component.newPassword = 'new123';
      component.confirmPassword = 'new123';
      component.onChangePassword();
      expect(component.savingPassword()).toBeFalse();
    });
  });

  describe('helper methods', () => {
    it('should return correct role label', () => {
      expect(component.getRoleLabel('ADMIN')).toBe('Administrador');
      expect(component.getRoleLabel('OPERADOR')).toBe('Operador');
    });

    it('should return correct role severity', () => {
      expect(component.getRoleSeverity('ADMIN')).toBe('danger');
      expect(component.getRoleSeverity('OPERADOR')).toBe('info');
    });

    it('should return initials for single name', () => {
      component.user = { name: 'João', email: '', role: 'OPERADOR' };
      expect(component.getUserInitials()).toBe('JO');
    });

    it('should return initials for full name', () => {
      component.user = { name: 'João Silva', email: '', role: 'OPERADOR' };
      expect(component.getUserInitials()).toBe('JS');
    });
  });
});
