import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService, Vehicle } from '../../../core/services/vehicle.service';
import { Page } from '@shared/types/Page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
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
    vehicleService = jasmine.createSpyObj('VehicleService', ['findAll', 'toggleStatus']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    vehicleService.findAll.and.returnValue(of(mockPage));
    vehicleService.toggleStatus.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [VehicleListComponent],
      providers: [
        provideRouter([]),
        { provide: VehicleService, useValue: vehicleService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(VehicleListComponent, {
      set: {
        providers: [],
        template: '<div></div>'
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load vehicles on init with default filter', () => {
    component.ngOnInit();
    expect(vehicleService.findAll).toHaveBeenCalledWith(0, 20, '', null);
    expect(component.vehicles().length).toBe(1);
  });

  it('should set loading false after load', () => {
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should apply filter', () => {
    component.ngOnInit();
    vehicleService.findAll.calls.reset();
    component.onFilter({ search: 'Honda', active: true });
    expect(vehicleService.findAll).toHaveBeenCalledWith(0, 20, 'Honda', true);
  });

  it('should handle load error and show toast', () => {
    vehicleService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should confirm toggle status', () => {
    component.confirmToggleStatus({ id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', active: true });
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should toggle status', () => {
    component.toggleStatus({ id: 1, clientId: 1, licensePlate: 'ABC-1234', brand: 'Honda', model: 'CG 160', active: true });
    expect(vehicleService.toggleStatus).toHaveBeenCalledWith(1);
  });

  it('should handle toggle status error', () => {
    vehicleService.toggleStatus.and.returnValue(throwError(() => new Error('err')));
    component.toggleStatus({ id: 1, clientId: 1, licensePlate: 'X', brand: 'X', model: 'X', active: true });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });
});
