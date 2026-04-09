import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VehicleFormComponent } from './vehicle-form.component';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ClientService } from '../../../core/services/client.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VehicleFormComponent', () => {
  let component: VehicleFormComponent;
  let fixture: ComponentFixture<VehicleFormComponent>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let clientService: jasmine.SpyObj<ClientService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  const mockClients = {
    content: [
      { id: 1, name: 'João' },
      { id: 2, name: 'Maria' }
    ],
    totalElements: 2, totalPages: 1, size: 100, number: 0
  };

  function setup(paramId: string | null = null) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: { get: (key: string) => paramId } } }
    });
    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    vehicleService = jasmine.createSpyObj('VehicleService', ['findById', 'create', 'update']);
    clientService = jasmine.createSpyObj('ClientService', ['findAll']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    clientService.findAll.and.returnValue(of(mockClients as any));

    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
      providers: [
        { provide: VehicleService, useValue: vehicleService },
        { provide: ClientService, useValue: clientService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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

    it('should load clients on init', () => {
      component.ngOnInit();
      expect(clientService.findAll).toHaveBeenCalledWith(0, 100);
      expect(component.clients.length).toBe(2);
    });

    it('should warn if no client selected on submit', () => {
      component.vehicle.clientId = 0;
      component.onSubmit();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });

    it('should create vehicle on submit', fakeAsync(() => {
      vehicleService.create.and.returnValue(of({ id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160' }));
      component.vehicle = { clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', year: '2023', color: '', chassisNumber: '', notes: '' };
      component.onSubmit();

      expect(vehicleService.create).toHaveBeenCalled();
      tick(1500);
      expect(router.navigate).toHaveBeenCalledWith(['/vehicles']);
    }));

    it('should handle create error', () => {
      vehicleService.create.and.returnValue(throwError(() => ({ error: { message: 'Placa duplicada' } })));
      component.vehicle = { clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', year: '', color: '', chassisNumber: '', notes: '' };
      component.onSubmit();
      expect(component.saving()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });
  });

  describe('edit mode', () => {
    const mockVehicle = { id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', year: '2023', color: 'Vermelha', chassisNumber: '', notes: '' };

    beforeEach(() => {
      vehicleService.findById.and.returnValue(of(mockVehicle));
      setup('1');
    });

    it('should be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
    });

    it('should load vehicle', () => {
      component.ngOnInit();
      expect(vehicleService.findById).toHaveBeenCalledWith(1);
      expect(component.vehicle.licensePlate).toBe('ABC-1234');
    });

    it('should handle load error', () => {
      vehicleService.findById.and.returnValue(throwError(() => new Error('not found')));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/vehicles']);
    });

    it('should update vehicle on submit', fakeAsync(() => {
      vehicleService.update.and.returnValue(of(mockVehicle));
      component.ngOnInit();
      component.onSubmit();
      expect(vehicleService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ licensePlate: 'ABC-1234' }));
      tick(1500);
      expect(router.navigate).toHaveBeenCalledWith(['/vehicles']);
    }));
  });

  describe('filterClients', () => {
    beforeEach(() => setup());

    it('should filter clients by name', () => {
      component.ngOnInit();
      component.filterClients({ query: 'jo' });
      expect(component.filteredClients.length).toBe(1);
      expect(component.filteredClients[0].name).toBe('João');
    });
  });

  describe('onClientSelect', () => {
    beforeEach(() => setup());

    it('should set clientId on select', () => {
      component.onClientSelect({ value: { id: 2, name: 'Maria' } });
      expect(component.vehicle.clientId).toBe(2);
    });
  });
});
