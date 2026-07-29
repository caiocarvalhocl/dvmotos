import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { of, throwError } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";

import { ServiceOrderFormComponent } from "./service-order-form.component";
import { ServiceOrderService } from "../../../core/services/service-order.service";
import { ClientService } from "../../../core/services/client.service";
import { VehicleService } from "../../../core/services/vehicle.service";
import { ProductService } from "../../../core/services/product.service";

describe("ServiceOrderFormComponent", () => {
  let component: ServiceOrderFormComponent;
  let fixture: ComponentFixture<ServiceOrderFormComponent>;
  let serviceOrderService: jasmine.SpyObj<ServiceOrderService>;
  let clientService: jasmine.SpyObj<ClientService>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let productService: jasmine.SpyObj<ProductService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let router: jasmine.SpyObj<Router>;

  const mockVehicles = [
    { id: 10, clientId: 5, licensePlate: "ABC-1234", brand: "Honda", model: "CG 160" },
    { id: 11, clientId: 5, licensePlate: "XYZ-9876", brand: "Yamaha", model: "Factor" },
  ] as any[];

  const emptyPage = { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };

  function setup(paramMap: any = { get: () => null }) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap } },
    });
    fixture = TestBed.createComponent(ServiceOrderFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    serviceOrderService = jasmine.createSpyObj("ServiceOrderService", [
      "findById", "create", "update", "addItem", "removeItem", "changeStatus",
    ]);
    clientService = jasmine.createSpyObj("ClientService", ["findAll", "findById"]);
    vehicleService = jasmine.createSpyObj("VehicleService", ["findByClient"]);
    productService = jasmine.createSpyObj("ProductService", ["findAll"]);
    messageService = jasmine.createSpyObj("MessageService", ["add"]);
    confirmationService = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    router = jasmine.createSpyObj("Router", ["navigate"]);

    // Safe defaults so ngOnInit's loadClients/loadProducts don't blow up.
    clientService.findAll.and.returnValue(of(emptyPage as any));
    productService.findAll.and.returnValue(of(emptyPage as any));
    vehicleService.findByClient.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ServiceOrderFormComponent],
      providers: [
        { provide: ServiceOrderService, useValue: serviceOrderService },
        { provide: ClientService, useValue: clientService },
        { provide: VehicleService, useValue: vehicleService },
        { provide: ProductService, useValue: productService },
        { provide: MessageService, useValue: messageService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ServiceOrderFormComponent, {
        set: { providers: [], template: "<div></div>" },
      })
      .compileComponents();
  });

  describe("create mode", () => {
    beforeEach(() => setup());

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should not be editing and should be editable", () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeFalse();
      expect(component.isEditable).toBeTrue();
    });

    it("should load clients and products on init", () => {
      component.ngOnInit();
      expect(clientService.findAll).toHaveBeenCalled();
      expect(productService.findAll).toHaveBeenCalled();
    });

    // ---- Reported bug: selecting a client must load that client's vehicles ----
    it("should load the selected client's vehicles into the dropdown", () => {
      vehicleService.findByClient.and.returnValue(of(mockVehicles));

      component.onClientSelect({ value: { id: 5, name: "Maria" } });

      expect(component.order.clientId).toBe(5);
      expect(component.order.vehicleId).toBe(0);
      expect(vehicleService.findByClient).toHaveBeenCalledWith(5);
      expect(component.clientVehicles).toEqual(mockVehicles);
    });

    it("should reset client and vehicles when the client is cleared", () => {
      component.clientVehicles = mockVehicles;
      component.order.clientId = 5;
      component.order.vehicleId = 10;

      component.onClientClear();

      expect(component.order.clientId).toBe(0);
      expect(component.order.vehicleId).toBe(0);
      expect(component.clientVehicles).toEqual([]);
    });
  });

  describe("item management (create mode, local)", () => {
    beforeEach(() => setup());

    it("should push a valid item locally with a computed totalPrice", () => {
      component.order.items = [];
      component.newItem = { type: "SERVICE", description: "Troca de óleo", quantity: 2, unitPrice: 50 };

      component.addItem();

      expect(component.order.items.length).toBe(1);
      expect(component.order.items[0].totalPrice).toBe(100);
      expect(component.showItemDialog).toBeFalse();
    });

    it("should warn and not add an item with invalid fields", () => {
      component.order.items = [];
      component.newItem = { type: "SERVICE", description: "", quantity: 1, unitPrice: 0 };

      component.addItem();

      expect(component.order.items.length).toBe(0);
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: "warn" }),
      );
    });

    it("should remove a local item by index", () => {
      component.order.items = [
        { type: "SERVICE", description: "a", quantity: 1, unitPrice: 10 },
        { type: "PART", description: "b", quantity: 1, unitPrice: 20 },
      ];
      component.removeItem(component.order.items[0], 0);
      expect(component.order.items.length).toBe(1);
      expect(component.order.items[0].description).toBe("b");
    });
  });

  describe("item management (edit mode, via API)", () => {
    beforeEach(() => {
      setup();
      component.isEditing.set(true);
      component.order = { id: 1, clientId: 1, vehicleId: 10, items: [] };
    });

    it("should add an item through the service and refresh the order", () => {
      const updated = { id: 1, clientId: 1, vehicleId: 10, items: [{ id: 9 }] } as any;
      serviceOrderService.addItem.and.returnValue(of(updated));
      component.newItem = { type: "PART", description: "Filtro", quantity: 1, unitPrice: 40 };

      component.addItem();

      expect(serviceOrderService.addItem).toHaveBeenCalledWith(1, component.newItem);
      expect(component.order).toEqual(updated);
      expect(component.showItemDialog).toBeFalse();
    });

    it("should remove a persisted item through the service", () => {
      const updated = { id: 1, clientId: 1, vehicleId: 10, items: [] } as any;
      serviceOrderService.removeItem.and.returnValue(of(updated));

      component.removeItem({ id: 7, type: "SERVICE", description: "x", quantity: 1, unitPrice: 10 }, 0);

      expect(serviceOrderService.removeItem).toHaveBeenCalledWith(1, 7);
      expect(component.order).toEqual(updated);
    });
  });

  describe("localTotal", () => {
    beforeEach(() => setup());

    it("should sum item totals and subtract the discount", () => {
      component.order.items = [
        { type: "SERVICE", description: "a", quantity: 2, unitPrice: 50 },
        { type: "PART", description: "b", quantity: 1, unitPrice: 30, totalPrice: 30 },
      ];
      component.order.discountAmount = 10;
      expect(component.localTotal).toBe(120);
    });

    it("should be 0 when there are no items", () => {
      component.order.items = [];
      component.order.discountAmount = 0;
      expect(component.localTotal).toBe(0);
    });
  });

  describe("onSubmit", () => {
    beforeEach(() => setup());

    it("should warn and not call the service when client or vehicle is missing", () => {
      component.order = { clientId: 0, vehicleId: 0, items: [] };
      component.onSubmit();
      expect(serviceOrderService.create).not.toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: "warn" }),
      );
    });

    it("should create and navigate to the saved order", fakeAsync(() => {
      component.order = { clientId: 1, vehicleId: 10, items: [], discountAmount: 0 };
      serviceOrderService.create.and.returnValue(
        of({ id: 99, clientId: 1, vehicleId: 10 } as any),
      );

      component.onSubmit();

      expect(serviceOrderService.create).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: "success" }),
      );
      tick(1000);
      expect(router.navigate).toHaveBeenCalledWith(["/service-orders", 99]);
    }));

    it("should surface the backend error and stop saving", fakeAsync(() => {
      component.order = { clientId: 1, vehicleId: 10, items: [] };
      serviceOrderService.create.and.returnValue(
        throwError(() => ({ error: { message: "O veículo não pertence ao cliente selecionado" } })),
      );

      component.onSubmit();
      tick();

      expect(component.saving()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: "error" }),
      );
    }));
  });

  describe("edit mode", () => {
    beforeEach(() => {
      serviceOrderService.findById.and.returnValue(
        of({ id: 1, clientId: 5, vehicleId: 10, status: "OPEN", items: [] } as any),
      );
      clientService.findById.and.returnValue(of({ id: 5, name: "Maria" } as any));
      vehicleService.findByClient.and.returnValue(of(mockVehicles));
      setup({ get: (key: string) => (key === "id" ? "1" : null) });
    });

    it("should load the order, its client, and the client's vehicles", () => {
      component.ngOnInit();
      expect(component.isEditing()).toBeTrue();
      expect(serviceOrderService.findById).toHaveBeenCalledWith(1);
      expect(component.selectedClient?.name).toBe("Maria");
      expect(vehicleService.findByClient).toHaveBeenCalledWith(5);
      expect(component.clientVehicles).toEqual(mockVehicles);
    });

    it("should redirect when the order is not found", () => {
      serviceOrderService.findById.and.returnValue(throwError(() => new Error("404")));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(["/service-orders"]);
    });

    it("should change status through the service after confirmation", () => {
      confirmationService.confirm.and.callFake((c: any) => {
        c.accept();
        return confirmationService;
      });
      component.order = { id: 1, clientId: 5, vehicleId: 10, status: "OPEN", items: [] };
      serviceOrderService.changeStatus.and.returnValue(
        of({ id: 1, status: "IN_PROGRESS" } as any),
      );

      component.changeStatus("IN_PROGRESS");

      expect(serviceOrderService.changeStatus).toHaveBeenCalledWith(1, "IN_PROGRESS");
      expect(component.order.status).toBe("IN_PROGRESS");
    });
  });

  describe("display helpers", () => {
    beforeEach(() => setup());

    it("should map status to labels", () => {
      expect(component.getStatusLabel("OPEN")).toBe("Aberta");
      expect(component.getStatusLabel("COMPLETED")).toBe("Concluída");
    });

    it("should map status to severities", () => {
      expect(component.getStatusSeverity("COMPLETED")).toBe("success");
      expect(component.getStatusSeverity("CANCELLED")).toBe("danger");
    });

    it("should map item types", () => {
      expect(component.getItemTypeLabel("SERVICE")).toBe("Serviço");
      expect(component.getItemTypeLabel("PART")).toBe("Peça");
    });
  });
});