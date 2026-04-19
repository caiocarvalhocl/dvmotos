import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientFormComponent } from './client-form.component';
import { ClientService, Client } from '../../../core/services/client.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let fixture: ComponentFixture<ClientFormComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  function setup(paramMap: any = { get: () => null }) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap } }
    });
    fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    clientService = jasmine.createSpyObj('ClientService', ['findById', 'create', 'update']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ClientFormComponent],
      providers: [
        { provide: ClientService, useValue: clientService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ClientFormComponent, {
      set: { providers: [] }
    })
    .compileComponents();
  });

  describe('create mode', () => {
    beforeEach(() => setup());

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should not be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeFalse();
    });

    it('should create client on submit', fakeAsync(() => {
      clientService.create.and.returnValue(of({ id: 1, name: 'João' }));
      component.client = { name: 'João', documentNumber: '', phone: '', email: '', address: '', city: '', state: '', zipCode: '', notes: '' };
      component.onSubmit();

      expect(clientService.create).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
      tick(1500);
      expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    }));

    it('should handle create error', fakeAsync(() => {
      clientService.create.and.returnValue(throwError(() => ({ error: { message: 'CPF duplicado' } })));
      component.client = { name: 'João', documentNumber: '', phone: '', email: '', address: '', city: '', state: '', zipCode: '', notes: '' };
      component.onSubmit();
      tick();
      expect(component.saving()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    }));
  });

  describe('edit mode', () => {
    const mockClient: Client = { id: 1, name: 'João', documentNumber: '123.456.789-00', phone: '', email: '', address: '', city: '', state: '', zipCode: '', notes: '' };

    beforeEach(() => {
      clientService.findById.and.returnValue(of(mockClient));
      setup({ get: (key: string) => key === 'id' ? '1' : null });
    });

    it('should be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
    });

    it('should load client', () => {
      component.ngOnInit();
      expect(clientService.findById).toHaveBeenCalledWith(1);
      expect(component.client.name).toBe('João');
    });

    it('should handle load error', () => {
      clientService.findById.and.returnValue(throwError(() => new Error('not found')));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    });

    it('should update client on submit', fakeAsync(() => {
      clientService.update.and.returnValue(of(mockClient));
      component.ngOnInit();
      component.onSubmit();
      expect(clientService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'João' }));
      tick(1500);
      expect(router.navigate).toHaveBeenCalledWith(['/clients']);
    }));
  });

  describe('updateDocumentMask', () => {
    beforeEach(() => setup());

    it('should use CPF mask for short documents', () => {
      component.client.documentNumber = '123.456.789-00';
      component.updateDocumentMask();
      expect(component.documentMask).toBe('999.999.999-99');
    });

    it('should use CNPJ mask for long documents', () => {
      component.client.documentNumber = '12.345.678/0001-90';
      component.updateDocumentMask();
      expect(component.documentMask).toBe('99.999.999/9999-99');
    });
  });
});
