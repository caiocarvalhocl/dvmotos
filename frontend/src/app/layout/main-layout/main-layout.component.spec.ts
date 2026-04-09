import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser: signal({ id: 1, name: 'Admin', email: 'a@a.com', role: 'ADMIN', active: true }),
      isAdmin: signal(true),
      isAuthenticated: signal(true),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items', () => {
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('should have user menu items', () => {
    expect(component.userMenuItems.length).toBeGreaterThan(0);
  });

  it('should have dashboard in menu', () => {
    expect(component.menuItems.find(i => i.label === 'Dashboard')).toBeTruthy();
  });

  it('should call logout from user menu', () => {
    const logoutItem = component.userMenuItems.find(i => i.label === 'Sair');
    logoutItem?.command!({} as any);
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
