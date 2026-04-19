import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService, Product } from '../../../core/services/product.service';
import { Page } from '@shared/types/Page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage: Page<Product> = {
    content: [{ id: 1, name: 'Óleo 10W40', salePrice: 35, stockQuantity: 50, minimumStock: 10, active: true, lowStock: false }],
    totalElements: 1, totalPages: 1, size: 20, number: 0
  };

  beforeEach(async () => {
    productService = jasmine.createSpyObj('ProductService', ['findAll', 'toggleStatus', 'countLowStock']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    productService.findAll.and.returnValue(of(mockPage));
    productService.toggleStatus.and.returnValue(of({} as any));
    productService.countLowStock.and.returnValue(of({ count: 3 }));

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ProductListComponent, {
      set: {
        providers: [],
        template: '<div></div>'
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load products and low stock count on init', () => {
    component.ngOnInit();
    expect(productService.findAll).toHaveBeenCalledWith(0, 20, '', null);
    expect(productService.countLowStock).toHaveBeenCalled();
    expect(component.products().length).toBe(1);
    expect(component.lowStockCount()).toBe(3);
  });

  it('should set loading false after load', () => {
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should handle load error and show toast', () => {
    productService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should apply filter and reload', () => {
    component.ngOnInit();
    productService.findAll.calls.reset();
    component.onFilter({ search: 'oleo', active: true });
    expect(productService.findAll).toHaveBeenCalledWith(0, 20, 'oleo', true);
  });

  it('should reload on status change', () => {
    component.ngOnInit();
    productService.findAll.calls.reset();
    component.onStatusChange();
    expect(productService.findAll).toHaveBeenCalled();
  });

  it('should confirm toggle status', () => {
    component.confirmToggleStatus({ id: 1, name: 'Óleo', salePrice: 35, stockQuantity: 50, active: true });
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should toggle status and reload', () => {
    productService.findAll.calls.reset();
    component.toggleStatus({ id: 1, name: 'Óleo', salePrice: 35, stockQuantity: 50, active: true });
    expect(productService.toggleStatus).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should handle toggle error', () => {
    productService.toggleStatus.and.returnValue(throwError(() => new Error('err')));
    component.toggleStatus({ id: 1, name: 'Óleo', salePrice: 35, stockQuantity: 50, active: true });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  describe('getStockSeverity', () => {
    it('should return danger for lowStock', () => {
      expect(component.getStockSeverity({ name: 'X', salePrice: 1, stockQuantity: 2, minimumStock: 10, lowStock: true })).toBe('danger');
    });
    it('should return warning for near minimum', () => {
      expect(component.getStockSeverity({ name: 'X', salePrice: 1, stockQuantity: 15, minimumStock: 10, lowStock: false })).toBe('warning');
    });
    it('should return success for healthy stock', () => {
      expect(component.getStockSeverity({ name: 'X', salePrice: 1, stockQuantity: 100, minimumStock: 10, lowStock: false })).toBe('success');
    });
  });
});
