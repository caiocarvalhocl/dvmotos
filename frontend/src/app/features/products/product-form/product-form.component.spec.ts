import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  function setup(routeParams: any = {}) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { params: routeParams } }
    });
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    productService = jasmine.createSpyObj('ProductService', ['findById', 'create', 'update']);
    categoryService = jasmine.createSpyObj('CategoryService', ['findAllActive']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    categoryService.findAllActive.and.returnValue(of([{ id: 1, name: 'Pneus' }, { id: 2, name: 'Óleos' }]));

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: CategoryService, useValue: categoryService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  describe('create mode', () => {
    beforeEach(() => setup());

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load categories on init', () => {
      component.ngOnInit();
      expect(categoryService.findAllActive).toHaveBeenCalled();
      expect(component.categories.length).toBe(2);
    });

    it('should not be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeFalse();
    });

    it('should warn if name is empty', () => {
      component.product.name = '  ';
      component.onSubmit();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });

    it('should warn if price is zero', () => {
      component.product.name = 'Óleo';
      component.product.salePrice = 0;
      component.onSubmit();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });

    it('should create product', fakeAsync(() => {
      productService.create.and.returnValue(of({ id: 1, name: 'Óleo', salePrice: 35, stockQuantity: 0 }));
      component.product = { name: 'Óleo', salePrice: 35, stockQuantity: 0, minimumStock: 5, unit: 'UN' };
      component.onSubmit();
      expect(productService.create).toHaveBeenCalled();
      tick(1000);
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));

    it('should handle create error', () => {
      productService.create.and.returnValue(throwError(() => ({ error: { message: 'Erro' } })));
      component.product = { name: 'Óleo', salePrice: 35, stockQuantity: 0, minimumStock: 5, unit: 'UN' };
      component.onSubmit();
      expect(component.saving()).toBeFalse();
    });
  });

  describe('edit mode', () => {
    const mockProduct = { id: 1, name: 'Óleo 10W40', salePrice: 35, stockQuantity: 50, minimumStock: 10, unit: 'UN' };

    beforeEach(() => {
      productService.findById.and.returnValue(of(mockProduct));
      setup({ id: 1 });
    });

    it('should be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
    });

    it('should load product', () => {
      component.ngOnInit();
      expect(productService.findById).toHaveBeenCalledWith(1);
      expect(component.product.name).toBe('Óleo 10W40');
    });

    it('should handle load error', () => {
      productService.findById.and.returnValue(throwError(() => new Error('not found')));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should update product', fakeAsync(() => {
      productService.update.and.returnValue(of(mockProduct));
      component.ngOnInit();
      component.onSubmit();
      expect(productService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'Óleo 10W40' }));
      tick(1000);
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));
  });
});
