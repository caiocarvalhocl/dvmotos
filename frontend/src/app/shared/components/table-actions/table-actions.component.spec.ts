import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableActionsComponent } from './table-actions.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TableActionsComponent', () => {
  let component: TableActionsComponent;
  let fixture: ComponentFixture<TableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('actionIcon', () => {
    it('should return trash icon when isActive is undefined', () => {
      component.isActive = undefined;
      expect(component.actionIcon).toBe('pi pi-trash');
    });

    it('should return ban icon when active', () => {
      component.isActive = true;
      expect(component.actionIcon).toBe('pi pi-ban');
    });

    it('should return check icon when inactive', () => {
      component.isActive = false;
      expect(component.actionIcon).toBe('pi pi-check-circle');
    });
  });

  describe('actionClass', () => {
    it('should contain btn-danger for undefined (delete)', () => {
      component.isActive = undefined;
      expect(component.actionClass).toContain('btn-danger');
    });

    it('should contain btn-danger for active (deactivate)', () => {
      component.isActive = true;
      expect(component.actionClass).toContain('btn-danger');
    });

    it('should contain btn-success for inactive (activate)', () => {
      component.isActive = false;
      expect(component.actionClass).toContain('btn-success');
    });
  });

  describe('actionTooltip', () => {
    it('should return Excluir when undefined', () => {
      component.isActive = undefined;
      expect(component.actionTooltip).toBe('Excluir');
    });

    it('should return Desativar when active', () => {
      component.isActive = true;
      expect(component.actionTooltip).toBe('Desativar');
    });

    it('should return Ativar when inactive', () => {
      component.isActive = false;
      expect(component.actionTooltip).toBe('Ativar');
    });
  });

  it('should emit onAction', () => {
    spyOn(component.onAction, 'emit');
    component.emitAction();
    expect(component.onAction.emit).toHaveBeenCalled();
  });

  it('should have default editTooltip', () => {
    expect(component.editTooltip).toBe('Editar');
  });
});
