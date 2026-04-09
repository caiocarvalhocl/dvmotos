import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientListComponent } from './client-list.component';
import { ClientService, Client, Page } from '../../../core/services/client.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage: Page<Client> = {
    content: [{ id: 1, name: 'João', active: true }],
    totalElements: 1, totalPages: 1, size: 20, number: 0
  };

  beforeEach(async () => {
    clientService = jasmine.createSpyObj('ClientService', ['findAll', 'delete', 'toggleStatus']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    clientService.findAll.and.returnValue(of(mockPage));
    clientService.delete.and.returnValue(of(void 0));
    clientService.toggleStatus.and.returnValue(of({ id: 1, name: 'João', active: false }));

    await TestBed.configureTestingModule({
      imports: [ClientListComponent],
      providers: [
        { provide: ClientService, useValue: clientService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on init', () => {
    component.ngOnInit();
    expect(clientService.findAll).toHaveBeenCalled();
    expect(component.clients().length).toBe(1);
    expect(component.totalRecords()).toBe(1);
  });

  it('should apply filter and reload', () => {
    component.ngOnInit();
    clientService.findAll.calls.reset();

    component.onFilter({ search: 'João', active: true });

    expect(component.currentFilter).toEqual({ search: 'João', active: true });
    expect(clientService.findAll).toHaveBeenCalledWith(0, 20, 'João', true);
  });

  it('should handle load error', () => {
    clientService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should confirm delete', () => {
    const client: Client = { id: 1, name: 'João', active: true };
    component.confirmDelete(client);
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should delete client and reload', () => {
    component.ngOnInit();
    clientService.findAll.calls.reset();

    component.deleteClient({ id: 1, name: 'João', active: true });

    expect(clientService.delete).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(clientService.findAll).toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    clientService.delete.and.returnValue(throwError(() => new Error('err')));
    component.deleteClient({ id: 1, name: 'João', active: true });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should confirm toggle status', () => {
    component.confirmToggleStatus({ id: 1, name: 'João', active: true });
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should toggle status and reload', () => {
    component.ngOnInit();
    clientService.findAll.calls.reset();

    component.toggleStatus({ id: 1, name: 'João', active: true });

    expect(clientService.toggleStatus).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should handle toggle status error', () => {
    clientService.toggleStatus.and.returnValue(throwError(() => new Error('err')));
    component.toggleStatus({ id: 1, name: 'João', active: true });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });
});
