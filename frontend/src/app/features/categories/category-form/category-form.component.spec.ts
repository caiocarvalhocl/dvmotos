import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoryFormComponent } from './category-form.component';
import { CategoryService } from '../../../core/services/category.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  function buildActivatedRoute(params: Record<string, any> = {}) {
    return { snapshot: { paramMap: convertToParamMap(params) } };
  }

  function createComponent(params: Record<string, any> = {}) {
    TestBed.overrideProvider(ActivatedRoute, { useValue: buildActivatedRoute(params) });
    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    categoryService = jasmine.createSpyObj('CategoryService', ['findById', 'create', 'update']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    categoryService.create.and.returnValue(of({ id: 1, name: 'Pneus' }));
    categoryService.update.and.returnValue(of({ id: 1, name: 'Pneus' }));

    await TestBed.configureTestingModule({
      imports: [CategoryFormComponent],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: buildActivatedRoute() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(CategoryFormComponent, {
      set: { providers: [], template: '<div></div>' }
    })
    .compileComponents();
  });

  describe('create mode', () => {
    beforeEach(() => createComponent());

    it('should create', () => expect(component).toBeTruthy());

    it('should not be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeFalse();
    });

    it('should create category on submit', fakeAsync(() => {
      component.ngOnInit();
      categoryService.create.and.returnValue(of({ id: 1, name: 'Pneus' }));
      component.category = { name: 'Pneus' };
      component.onSubmit();
      tick(1000);
      expect(categoryService.create).toHaveBeenCalledWith({ name: 'Pneus' });
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
      expect(router.navigate).toHaveBeenCalledWith(['/categories']);
    }));

    it('should handle create error', fakeAsync(() => {
      component.ngOnInit();
      categoryService.create.and.returnValue(throwError(() => ({ error: { message: 'Já existe' } })));
      component.category = { name: 'Pneus' };
      component.onSubmit();
      tick();
      expect(component.saving()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    }));
  });

  describe('edit mode', () => {
    beforeEach(() => {
      categoryService.findById.and.returnValue(of({ id: 1, name: 'Pneus', active: true }));
      createComponent({ id: '1' });
    });

    it('should be editing', () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
    });

    it('should load category', () => {
      component.ngOnInit();
      expect(categoryService.findById).toHaveBeenCalledWith(1);
      expect(component.category.name).toBe('Pneus');
    });

    it('should handle load error and navigate away', () => {
      categoryService.findById.and.returnValue(throwError(() => new Error('not found')));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/categories']);
    });

    it('should update category on submit', fakeAsync(() => {
      categoryService.update.and.returnValue(of({ id: 1, name: 'Pneus Editado' }));
      component.ngOnInit();
      component.category.name = 'Pneus Editado';
      component.onSubmit();
      tick(1000);
      expect(categoryService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'Pneus Editado' }));
      expect(router.navigate).toHaveBeenCalledWith(['/categories']);
    }));
  });
});
