import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  ServiceOrderService,
  ServiceOrder,
  ServiceOrderItem,
} from "../service-order.service";
import { Page } from "@shared/types/Page";
import { environment } from "@env/environment";

describe("ServiceOrderService", () => {
  let service: ServiceOrderService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/service-orders`;

  const mockOrder: ServiceOrder = {
    id: 1,
    clientId: 1,
    clientName: "João",
    vehicleId: 10,
    vehiclePlate: "ABC-1234",
    status: "OPEN",
    entryMileage: 15000,
    discountAmount: 0,
    totalAmount: 250,
    items: [],
  };

  const mockPage: Page<ServiceOrder> = {
    content: [mockOrder],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceOrderService],
    });
    service = TestBed.inject(ServiceOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("findAll", () => {
    it("should send page and size, and omit empty search/status", () => {
      service.findAll(0, 20).subscribe((res) => expect(res).toEqual(mockPage));
      const req = httpMock.expectOne(
        (r) =>
          r.url === apiUrl &&
          r.params.get("page") === "0" &&
          r.params.get("size") === "20" &&
          !r.params.has("search") &&
          !r.params.has("status"),
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should include search and status when provided", () => {
      service.findAll(2, 10, "honda", "OPEN").subscribe();
      const req = httpMock.expectOne(
        (r) =>
          r.url === apiUrl &&
          r.params.get("page") === "2" &&
          r.params.get("search") === "honda" &&
          r.params.get("status") === "OPEN",
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });
  });

  it("findById should GET by id", () => {
    service.findById(1).subscribe((res) => expect(res).toEqual(mockOrder));
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("GET");
    req.flush(mockOrder);
  });

  it("findByVehicle should GET the vehicle sub-resource with paging", () => {
    service.findByVehicle(10, 0, 20).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/vehicle/10` && r.params.get("page") === "0",
    );
    expect(req.request.method).toBe("GET");
    req.flush(mockPage);
  });

  it("create should POST the request body", () => {
    const body = { clientId: 1, vehicleId: 10, items: [] };
    service.create(body).subscribe((res) => expect(res).toEqual(mockOrder));
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(body);
    req.flush(mockOrder);
  });

  it("update should PUT to the id resource", () => {
    const body = { clientId: 1, vehicleId: 10 };
    service.update(1, body).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("PUT");
    req.flush(mockOrder);
  });

  it("addItem should POST to the items sub-resource", () => {
    const item: ServiceOrderItem = {
      type: "SERVICE",
      description: "Troca de óleo",
      quantity: 1,
      unitPrice: 80,
    };
    service.addItem(1, item).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/items`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(item);
    req.flush(mockOrder);
  });

  it("removeItem should DELETE the specific item", () => {
    service.removeItem(1, 5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/items/5`);
    expect(req.request.method).toBe("DELETE");
    req.flush(mockOrder);
  });

  it("changeStatus should PATCH the status resource with the new status", () => {
    service.changeStatus(1, "COMPLETED").subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1/status`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status: "COMPLETED" });
    req.flush(mockOrder);
  });

  it("countByStatus should GET count with the status param", () => {
    service
      .countByStatus("OPEN")
      .subscribe((res) => expect(res).toEqual({ count: 3 }));
    const req = httpMock.expectOne(
      (r) => r.url === `${apiUrl}/count` && r.params.get("status") === "OPEN",
    );
    req.flush({ count: 3 });
  });
});
