import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '@core/services/client.service';
import { VehicleService } from '@core/services/vehicle.service';
import { ProductService } from '@core/services/product.service';
import { ServiceOrderService } from '@core/services/service-order.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: any;
  let clientService: jasmine.SpyObj<ClientService>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let productService: jasmine.SpyObj<ProductService>;
  let serviceOrderService: jasmine.SpyObj<ServiceOrderService>;

  const mockAdminUser = {
    id: 1,
    name: 'Admin User',
    email: 'a@a.com',
    role: 'ADMIN' as const,
    active: true,
  };

  const mockOperatorUser = {
    id: 2,
    name: 'Operador',
    email: 'op@a.com',
    role: 'OPERADOR' as const,
    active: true,
  };

  function setupTestBed(currentUser: any) {
    authService = {
      currentUser: signal(currentUser),
    };
    clientService = jasmine.createSpyObj('ClientService', ['getActiveClients']);
    vehicleService = jasmine.createSpyObj('VehicleService', ['getActiveVehicles']);
    productService = jasmine.createSpyObj('ProductService', [
      'countLowStock',
      'findLowStock',
    ]);
    serviceOrderService = jasmine.createSpyObj('ServiceOrderService', ['countByStatus']);

    clientService.getActiveClients.and.returnValue(of(10 as any));
    vehicleService.getActiveVehicles.and.returnValue(of(5 as any));
    productService.countLowStock.and.returnValue(of({ count: 2 }));
    productService.findLowStock.and.returnValue(of([]));
    serviceOrderService.countByStatus.and.callFake((status) => {
      const counts: Record<string, number> = {
        OPEN: 3,
        IN_PROGRESS: 4,
        WAITING_PARTS: 1,
        COMPLETED: 99,
        CANCELLED: 0,
      };
      return of({ count: counts[status] ?? 0 });
    });

    return TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ClientService, useValue: clientService },
        { provide: VehicleService, useValue: vehicleService },
        { provide: ProductService, useValue: productService },
        { provide: ServiceOrderService, useValue: serviceOrderService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  describe('as ADMIN', () => {
    beforeEach(async () => {
      await setupTestBed(mockAdminUser);
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should recognize admin user', () => {
      expect(component.isAdmin()).toBeTrue();
    });

    it('should load client and vehicle counts on init', () => {
      component.ngOnInit();
      expect(clientService.getActiveClients).toHaveBeenCalled();
      expect(vehicleService.getActiveVehicles).toHaveBeenCalled();
      expect(component.countClients()).toBe(10);
      expect(component.countVehicles()).toBe(5);
    });

    it('should load low stock count on init', () => {
      component.ngOnInit();
      expect(productService.countLowStock).toHaveBeenCalled();
      expect(component.countLowStock()).toBe(2);
    });

    it('should sum pending orders from 3 statuses', () => {
      component.ngOnInit();
      expect(serviceOrderService.countByStatus).toHaveBeenCalledWith('OPEN');
      expect(serviceOrderService.countByStatus).toHaveBeenCalledWith('IN_PROGRESS');
      expect(serviceOrderService.countByStatus).toHaveBeenCalledWith('WAITING_PARTS');
      // OPEN(3) + IN_PROGRESS(4) + WAITING_PARTS(1) = 8
      expect(component.countPendingOrders()).toBe(8);
    });

    it('should load low stock products on init', () => {
      component.ngOnInit();
      expect(productService.findLowStock).toHaveBeenCalled();
      expect(component.loadingLowStock()).toBeFalse();
    });
  });

  describe('as OPERADOR', () => {
    beforeEach(async () => {
      await setupTestBed(mockOperatorUser);
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
    });

    it('should not be admin', () => {
      expect(component.isAdmin()).toBeFalse();
    });

    it('should NOT load stats on init', () => {
      component.ngOnInit();
      expect(clientService.getActiveClients).not.toHaveBeenCalled();
      expect(vehicleService.getActiveVehicles).not.toHaveBeenCalled();
      expect(productService.countLowStock).not.toHaveBeenCalled();
      expect(serviceOrderService.countByStatus).not.toHaveBeenCalled();
    });

    it('should NOT load low stock products on init', () => {
      component.ngOnInit();
      expect(productService.findLowStock).not.toHaveBeenCalled();
    });
  });
});
