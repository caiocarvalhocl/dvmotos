import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { provideRouter } from "@angular/router";
import { of, throwError } from "rxjs";
import { ConfirmationService, MessageService } from "primeng/api";

import { ServiceOrderListComponent } from "./service-order-list.component";
import { ServiceOrderService } from "../../../core/services/service-order.service";

describe("ServiceOrderListComponent", () => {
  let component: ServiceOrderListComponent;
  let fixture: ComponentFixture<ServiceOrderListComponent>;
  let serviceOrderService: jasmine.SpyObj<ServiceOrderService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockPage = {
    content: [
      { id: 1, clientId: 1, vehicleId: 10, status: "OPEN" },
      { id: 2, clientId: 2, vehicleId: 20, status: "COMPLETED" },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 20,
    number: 0,
  } as any;

  beforeEach(async () => {
    serviceOrderService = jasmine.createSpyObj("ServiceOrderService", ["findAll", "changeStatus"]);
    confirmationService = jasmine.createSpyObj("ConfirmationService", ["confirm"]);
    messageService = jasmine.createSpyObj("MessageService", ["add"]);

    serviceOrderService.findAll.and.returnValue(of(mockPage));

    await TestBed.configureTestingModule({
      imports: [ServiceOrderListComponent],
      providers: [
        provideRouter([]),
        { provide: ServiceOrderService, useValue: serviceOrderService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: MessageService, useValue: messageService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ServiceOrderListComponent, {
        set: { providers: [], template: "<div></div>" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ServiceOrderListComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load orders on init and populate signals", () => {
    component.ngOnInit();
    expect(serviceOrderService.findAll).toHaveBeenCalled();
    expect(component.orders().length).toBe(2);
    expect(component.totalRecords()).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it("should convert paginator event into a zero-based page", () => {
    component.currentFilter = { search: "abc", active: null };
    component.selectedStatus = "OPEN";
    component.loadOrders({ first: 40, rows: 20 });
    expect(serviceOrderService.findAll).toHaveBeenCalledWith(2, 20, "abc", "OPEN");
  });

  it("should reset to the first page when filtering", () => {
    component.onFilter({ search: "honda", active: null });
    expect(component.currentFilter.search).toBe("honda");
    expect(serviceOrderService.findAll).toHaveBeenCalledWith(0, 20, "honda", null);
  });

  it("should reload when the status filter changes", () => {
    serviceOrderService.findAll.calls.reset();
    component.onStatusChange();
    expect(serviceOrderService.findAll).toHaveBeenCalled();
  });

  it("should show an error toast when loading fails", () => {
    serviceOrderService.findAll.and.returnValue(throwError(() => new Error("boom")));
    component.loadOrders({ first: 0, rows: 20 });
    expect(component.loading()).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: "error" }),
    );
  });

  it("should cancel an order through the service after confirmation", () => {
    confirmationService.confirm.and.callFake((c: any) => {
      c.accept();
      return confirmationService;
    });
    serviceOrderService.changeStatus.and.returnValue(of({ id: 1, status: "CANCELLED" } as any));

    component.confirmCancel({ id: 1, clientId: 1, vehicleId: 10, status: "OPEN" } as any);

    expect(serviceOrderService.changeStatus).toHaveBeenCalledWith(1, "CANCELLED");
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: "success" }),
    );
  });

  it("canCancel should be false for completed or cancelled orders", () => {
    expect(component.canCancel({ status: "OPEN" } as any)).toBeTrue();
    expect(component.canCancel({ status: "COMPLETED" } as any)).toBeFalse();
    expect(component.canCancel({ status: "CANCELLED" } as any)).toBeFalse();
  });

  it("should map status labels and severities", () => {
    expect(component.getStatusLabel("IN_PROGRESS")).toBe("Em Andamento");
    expect(component.getStatusSeverity("OPEN")).toBe("info");
    expect(component.getStatusSeverity("CANCELLED")).toBe("danger");
  });
});