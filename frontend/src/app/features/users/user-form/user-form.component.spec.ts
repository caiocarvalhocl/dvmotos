import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { UserFormComponent } from "./user-form.component";
import { UserService, User } from "../../../core/services/user.service";
import { AuthService } from "../../../core/services/auth.service";
import { MessageService } from "primeng/api";
import { ActivatedRoute, Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { NO_ERRORS_SCHEMA, signal } from "@angular/core";

describe("UserFormComponent", () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let authServiceMock: any;

  const adminUser = {
    id: 1,
    name: "Admin",
    email: "admin@test.com",
    role: "ADMIN" as const,
    active: true,
  };

  function setup(paramId: string | null = null, loggedUser = adminUser) {
    authServiceMock = {
      currentUser: jasmine.createSpy("currentUser").and.returnValue(loggedUser),
      isAdmin: signal(loggedUser.role === "ADMIN"),
      isAuthenticated: signal(true),
    };

    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: { get: (key: string) => paramId } } },
    });
    TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    userService = jasmine.createSpyObj("UserService", [
      "findById",
      "create",
      "update",
    ]);
    messageService = jasmine.createSpyObj("MessageService", ["add"]);
    router = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: {} },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe("create mode (Admin)", () => {
    beforeEach(() => setup(null, adminUser));

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should not be editing", () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeFalse();
    });

    it("should allow editing password in create mode", () => {
      component.ngOnInit();
      expect(component.canEditPassword()).toBeTrue();
    });

    it("should create user on submit", fakeAsync(() => {
      userService.create.and.returnValue(
        of({
          id: 2,
          name: "Novo",
          email: "n@n.com",
          role: "OPERADOR" as const,
        }),
      );
      component.ngOnInit();
      component.user = {
        name: "Novo",
        email: "n@n.com",
        password: "123456",
        role: "OPERADOR",
      };
      component.onSubmit();

      expect(userService.create).toHaveBeenCalled();
      tick(1500);
      expect(router.navigate).toHaveBeenCalledWith(["/users"]);
    }));

    it("should handle create error", () => {
      userService.create.and.returnValue(
        throwError(() => ({ error: { message: "Email duplicado" } })),
      );
      component.ngOnInit();
      component.user = {
        name: "Novo",
        email: "n@n.com",
        password: "123456",
        role: "OPERADOR",
      };
      component.onSubmit();
      expect(component.saving()).toBeFalse();
    });
  });

  describe("edit mode (Admin editing another user)", () => {
    beforeEach(() => {
      userService.findById.and.returnValue(
        of({
          id: 2,
          name: "Operador",
          email: "op@test.com",
          role: "OPERADOR" as const,
          active: true,
        }),
      );
      setup("2", adminUser);
    });

    it("should be editing", () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
    });

    it("should load user", () => {
      component.ngOnInit();
      expect(userService.findById).toHaveBeenCalledWith(2);
    });

    it("should allow editing role", () => {
      component.ngOnInit();
      expect(component.canEditRole()).toBeTrue();
    });

    it("should NOT allow editing password of another user", () => {
      component.ngOnInit();
      expect(component.canEditPassword()).toBeFalse();
    });
  });

  describe("Operador access control", () => {
    const operadorUser = {
      id: 5,
      name: "Op",
      email: "op@test.com",
      role: "OPERADOR" as const,
      active: true,
    };

    it("should redirect if Operador tries to edit another user", () => {
      setup("99", operadorUser);
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(["/home"]);
    });

    it("should allow Operador to edit own profile", () => {
      userService.findById.and.returnValue(of(operadorUser));
      setup("5", operadorUser);
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalledWith(["/home"]);
    });
  });

  describe("onCancel", () => {
    it("should navigate to /users for admin", () => {
      setup(null, adminUser);
      component.ngOnInit();
      // canEditRole requires editing another user; for cancel we check currentUser role
      // Admin with canEditRole true -> /users
      component.user = {
        id: 2,
        name: "Other",
        email: "o@o.com",
        role: "OPERADOR",
      };
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(["/users"]);
    });
  });
});
