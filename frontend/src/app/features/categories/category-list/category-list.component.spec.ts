import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryListComponent } from './category-list.component';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Page } from '@shared/types/Page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage: Page<Category> = {
    content: [
      { id: 1, name: 'Pneus', active: true },
      { id: 2, name: 'Óleos', active: false }
    ],
    totalElements: 2, totalPages: 1, size: 20, number: 0
  };

  beforeEach(async () => {
    categoryService = jasmine.createSpyObj('CategoryService', ['findAll', 'toggleStatus']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    categoryService.findAll.and.returnValue(of(mockPage));
    categoryService.toggleStatus.and.returnValue(of({ id: 1, name: 'Pneus', active: false }));

    await TestBed.configureTestingModule({
      imports: [CategoryListComponent],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load categories on init with default filter (empty search, active null)', () => {
    component.ngOnInit();
    expect(categoryService.findAll).toHaveBeenCalledWith(0, 20, '', null);
    expect(component.categories().length).toBe(2);
    expect(component.totalRecords()).toBe(2);
  });

  it('should set loading false after load', () => {
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
  });

  it('should handle load error and show toast', () => {
    categoryService.findAll.and.returnValue(throwError(() => new Error('err')));
    component.ngOnInit();
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalled();
  });

  it('should apply filter and reload from page 1', () => {
    component.ngOnInit();
    categoryService.findAll.calls.reset();
    component.onFilter({ search: 'pneu', active: true });
    expect(component.currentFilter).toEqual({ search: 'pneu', active: true });
    expect(categoryService.findAll).toHaveBeenCalledWith(0, 20, 'pneu', true);
  });

  it('should confirm toggle status', () => {
    component.confirmToggleStatus({ id: 1, name: 'Pneus', active: true });
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should toggle status and reload', () => {
    categoryService.findAll.calls.reset();
    component.toggleStatus({ id: 1, name: 'Pneus', active: true });
    expect(categoryService.toggleStatus).toHaveBeenCalledWith(1);
    expect(messageService.add).toHaveBeenCalled();
    expect(categoryService.findAll).toHaveBeenCalled();
  });

  it('should handle toggle status error', () => {
    categoryService.toggleStatus.and.returnValue(throwError(() => new Error('err')));
    component.toggleStatus({ id: 1, name: 'Pneus', active: true });
    expect(messageService.add).toHaveBeenCalled();
  });
});
