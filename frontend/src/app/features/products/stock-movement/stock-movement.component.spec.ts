import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockMovementComponent } from './stock-movement.component';
import { ProductService } from '../../../core/services/product.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StockMovementComponent', () => {
  let component: StockMovementComponent;
  let fixture: ComponentFixture<StockMovementComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct = { id: 1, name: 'Óleo 10W40', salePrice: 35, stockQuantity: 50, minimumStock: 10 };
  const mockMovements = {
    content: [{ id: 1, type: 'IN', quantity: 10, reason: 'Compra', createdAt: '2024-01-01' }],
    totalElements: 1, totalPages: 1, size: 10, number: 0
  };

  function setup(routeParams: any = {}) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { params: routeParams } }
    });
    fixture = TestBed.createComponent(StockMovementComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    productService = jasmine.createSpyObj('ProductService', ['findById', 'getStockHistory', 'addStockMovement']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    productService.findById.and.returnValue(of(mockProduct));
    productService.getStockHistory.and.returnValue(of(mockMovements as any));
    productService.addStockMovement.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [StockMovementComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  describe('with product id', () => {
    beforeEach(() => setup({ id: 1 }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load product and movements on init', () => {
      component.ngOnInit();
      expect(productService.findById).toHaveBeenCalledWith(1);
      expect(productService.getStockHistory).toHaveBeenCalledWith(1, 0, 10);
      expect(component.product?.name).toBe('Óleo 10W40');
      expect(component.movements().length).toBe(1);
    });

    it('should handle product load error', () => {
      productService.findById.and.returnValue(throwError(() => new Error('err')));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should warn if quantity is zero on submit', () => {
      component.ngOnInit();
      component.quantity = 0;
      component.onSubmit();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });

    it('should add stock movement', () => {
      component.ngOnInit();
      component.movementType = 'IN';
      component.quantity = 5;
      component.reason = 'Compra';
      component.onSubmit();

      expect(productService.addStockMovement).toHaveBeenCalledWith(1, { type: 'IN', quantity: 5, reason: 'Compra' });
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
      expect(component.quantity).toBe(1);
      expect(component.reason).toBe('');
    });

    it('should handle add movement error', () => {
      productService.addStockMovement.and.returnValue(throwError(() => ({ error: { message: 'Estoque insuficiente' } })));
      component.ngOnInit();
      component.quantity = 5;
      component.onSubmit();
      expect(component.saving()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });
  });

  describe('without product id', () => {
    beforeEach(() => setup({}));

    it('should navigate to products if no id', () => {
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('helper methods', () => {
    beforeEach(() => setup({ id: 1 }));

    it('should return correct type severity', () => {
      expect(component.getTypeSeverity('IN')).toBe('success');
      expect(component.getTypeSeverity('OUT')).toBe('danger');
      expect(component.getTypeSeverity('ADJUSTMENT')).toBe('info');
    });

    it('should return correct type label', () => {
      expect(component.getTypeLabel('IN')).toBe('Entrada');
      expect(component.getTypeLabel('OUT')).toBe('Saída');
      expect(component.getTypeLabel('ADJUSTMENT')).toBe('Ajuste');
    });
  });
});
