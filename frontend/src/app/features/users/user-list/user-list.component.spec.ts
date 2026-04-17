import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService, User } from '../../../core/services/user.service';
import { Page } from '@shared/types/Page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage: Page<User> = {
    content: [{ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN', active: true }],
    totalElements: 1, totalPages: 1, size: 20, number: 0
  };

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['findAll', 'toggleStatus']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    userService.findAll.and.returnValue(of(mockPage));
    userService.toggleStatus.and.returnValue(
      of({ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN' as const, active: false })
    );

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load users on init with default filter', () => {
    component.ngOnInit();
    expect(userService.findAll).toHaveBeenCalledWith(0, 20, '', null);
    expect(component.users().length).toBe(1);
  });

  it('should set loading false after load', () => {
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should apply filter', () => {
    component.ngOnInit();
    userService.findAll.calls.reset();
    component.onFilter({ search: 'admin', active: true });
    expect(userService.findAll).toHaveBeenCalledWith(0, 20, 'admin', true);
  });

  it('should handle load error and show toast', () => {
    userService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should confirm toggle status', () => {
    component.confirmToggleStatus({ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN', active: true });
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should toggle status', () => {
    component.toggleStatus({ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN', active: true });
    expect(userService.toggleStatus).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should return correct role label', () => {
    expect(component.getRoleLabel('ADMIN')).toBe('Administrador');
    expect(component.getRoleLabel('OPERADOR')).toBe('Operador');
  });

  it('should return correct role severity', () => {
    expect(component.getRoleSeverity('ADMIN')).toBe('danger');
    expect(component.getRoleSeverity('OPERADOR')).toBe('info');
  });
});
