import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService, Vehicle } from '../../../core/services/vehicle.service';
import { Page } from '../../../core/services/client.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage: Page<Vehicle> = {
    content: [{ id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', active: true }],
    totalElements: 1, totalPages: 1, size: 20, number: 0
  };

  beforeEach(async () => {
    vehicleService = jasmine.createSpyObj('VehicleService', ['findAll', 'delete', 'toggleStatus']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    vehicleService.findAll.and.returnValue(of(mockPage));
    vehicleService.delete.and.returnValue(of(void 0));
    vehicleService.toggleStatus.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [VehicleListComponent],
      providers: [
        { provide: VehicleService, useValue: vehicleService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load vehicles on init', () => {
    component.ngOnInit();
    expect(vehicleService.findAll).toHaveBeenCalled();
    expect(component.vehicles().length).toBe(1);
  });

  it('should apply filter', () => {
    component.ngOnInit();
    vehicleService.findAll.calls.reset();
    component.onFilter({ search: 'Honda', active: true });
    expect(vehicleService.findAll).toHaveBeenCalledWith(0, 20, 'Honda', true);
  });

  it('should handle load error', () => {
    vehicleService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should delete vehicle', () => {
    component.ngOnInit();
    const v: Vehicle = { id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', active: true };
    component.deleteVehicle(v);
    expect(vehicleService.delete).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should handle delete error', () => {
    vehicleService.delete.and.returnValue(throwError(() => new Error('err')));
    component.deleteVehicle({ id: 1, clientId: 1, licensePlate: 'X', brand: 'X', model: 'X' });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should toggle status', () => {
    component.ngOnInit();
    component.toggleStatus({ id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', active: true });
    expect(vehicleService.toggleStatus).toHaveBeenCalledWith(1);
  });

  it('should handle toggle status error', () => {
    vehicleService.toggleStatus.and.returnValue(throwError(() => new Error('err')));
    component.toggleStatus({ id: 1, clientId: 1, licensePlate: 'X', brand: 'X', model: 'X', active: true });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });
});
