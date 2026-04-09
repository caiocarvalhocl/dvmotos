import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '@core/services/client.service';
import { VehicleService } from '@core/services/vehicle.service';
import { of, signal } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let clientService: jasmine.SpyObj<ClientService>;
  let vehicleService: jasmine.SpyObj<VehicleService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [], {
      currentUser: signal({ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN', active: true }),
      isAdmin: signal(true),
      isAuthenticated: signal(true)
    });
    clientService = jasmine.createSpyObj('ClientService', ['getActiveClients']);
    vehicleService = jasmine.createSpyObj('VehicleService', ['getActiveVehicles']);

    clientService.getActiveClients.and.returnValue(of(10));
    vehicleService.getActiveVehicles.and.returnValue(of(5));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ClientService, useValue: clientService },
        { provide: VehicleService, useValue: vehicleService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have countClients$ observable', () => {
    component.countClients$.subscribe(count => {
      expect(count).toBe(10);
    });
  });

  it('should have countVehicles$ observable', () => {
    component.countVehicles$.subscribe(count => {
      expect(count).toBe(5);
    });
  });
});
