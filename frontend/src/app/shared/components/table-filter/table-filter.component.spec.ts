import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TableFilterComponent } from './table-filter.component';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TableFilterComponent', () => {
  let component: TableFilterComponent;
  let fixture: ComponentFixture<TableFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFilterComponent, FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TableFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder).toBe('Pesquisar...');
  });

  it('should show status by default', () => {
    expect(component.showStatus).toBeTrue();
  });

  it('should have status options', () => {
    expect(component.statusOptions.length).toBe(3);
  });

  it('should emit filter on search with debounce', fakeAsync(() => {
    spyOn(component.filterChange, 'emit');
    component.searchTerm = 'test';
    component.onSearchChange('test');
    tick(500);
    expect(component.filterChange.emit).toHaveBeenCalledWith({ search: 'test', active: null });
  }));

  it('should not emit before debounce', fakeAsync(() => {
    spyOn(component.filterChange, 'emit');
    component.onSearchChange('test');
    tick(200);
    expect(component.filterChange.emit).not.toHaveBeenCalled();
    tick(300);
    expect(component.filterChange.emit).toHaveBeenCalled();
  }));

  it('should emit filter immediately on emitFilter call', () => {
    spyOn(component.filterChange, 'emit');
    component.searchTerm = 'abc';
    component.selectedStatus = true;
    component.emitFilter();
    expect(component.filterChange.emit).toHaveBeenCalledWith({ search: 'abc', active: true });
  });

  it('should unsubscribe on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
