import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { VehicleService, Vehicle } from "../vehicle.service";
import { Page } from "@shared/types/Page";
import { environment } from "@env/environment";

describe("VehicleService", () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/vehicles`;

  const mockVehicle: Vehicle = {
    id: 1,
    clientId: 10,
    clientName: "John Doe",
    licensePlate: "ABC-1234",
    brand: "Honda",
    model: "CB 500",
    year: "2022",
    color: "Preta",
    chassisNumber: "9BWZZZ377VT004251",
    currentMileage: 15000,
    notes: "Bem conservada",
    active: true,
    createdAt: "2024-01-01T00:00:00",
  };

  const mockPage: Page<Vehicle> = {
    content: [mockVehicle],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehicleService],
    });

    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("Service Initialization", () => {
    it("should be created", () => {
      expect(service).toBeTruthy();
    });
  });

  describe("findAll()", () => {
    it("should fetch all vehicles with default pagination", (done) => {
      service.findAll().subscribe({
        next: (page) => {
          expect(page).toEqual(mockPage);
          expect(page.content.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch vehicles with custom pagination", (done) => {
      service.findAll(1, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&size=10`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch vehicles with search parameter", (done) => {
      const searchTerm = "Honda";

      service.findAll(0, 20, searchTerm).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url.includes(apiUrl) && req.params.get("search") === searchTerm,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch only active vehicles", (done) => {
      service.findAll(0, 20, undefined, true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=true`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch only inactive vehicles", (done) => {
      service.findAll(0, 20, undefined, false).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=false`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch all vehicles when active is null", (done) => {
      service.findAll(0, 20, undefined, null).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.params.has("active")).toBeFalse();
      req.flush(mockPage);
    });

    it("should combine search and active filters", (done) => {
      service.findAll(0, 20, "CB 500", true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=CB%20500&active=true`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });
  });

  describe("findById()", () => {
    it("should fetch vehicle by id", (done) => {
      const vehicleId = 1;

      service.findById(vehicleId).subscribe({
        next: (vehicle) => {
          expect(vehicle).toEqual(mockVehicle);
          expect(vehicle.id).toBe(vehicleId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVehicle);
    });

    it("should handle vehicle not found error", (done) => {
      const vehicleId = 999;

      service.findById(vehicleId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      req.flush("Vehicle not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("findByLicensePlate()", () => {
    it("should fetch vehicle by license plate", (done) => {
      const licensePlate = "ABC-1234";

      service.findByLicensePlate(licensePlate).subscribe({
        next: (vehicle) => {
          expect(vehicle).toEqual(mockVehicle);
          expect(vehicle.licensePlate).toBe(licensePlate);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/license-plate/${licensePlate}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVehicle);
    });

    it("should handle license plate not found", (done) => {
      const licensePlate = "XYZ-9999";

      service.findByLicensePlate(licensePlate).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/license-plate/${licensePlate}`);
      req.flush("Vehicle not found", { status: 404, statusText: "Not Found" });
    });

    it("should handle license plate with special characters", (done) => {
      const licensePlate = "ABC-1D34"; // Placa Mercosul

      service.findByLicensePlate(licensePlate).subscribe({
        next: (vehicle) => {
          expect(vehicle).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/license-plate/${licensePlate}`);
      req.flush(mockVehicle);
    });
  });

  describe("findByClient()", () => {
    it("should fetch all vehicles for a client", (done) => {
      const clientId = 10;
      const clientVehicles = [
        mockVehicle,
        { ...mockVehicle, id: 2, licensePlate: "DEF-5678" },
      ];

      service.findByClient(clientId).subscribe({
        next: (vehicles) => {
          expect(vehicles.length).toBe(2);
          expect(vehicles[0].clientId).toBe(clientId);
          expect(vehicles[1].clientId).toBe(clientId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/client/${clientId}`);
      expect(req.request.method).toBe("GET");
      req.flush(clientVehicles);
    });

    it("should handle client with no vehicles", (done) => {
      const clientId = 99;

      service.findByClient(clientId).subscribe({
        next: (vehicles) => {
          expect(vehicles.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/client/${clientId}`);
      req.flush([]);
    });

    it("should handle non-existent client", (done) => {
      const clientId = 999;

      service.findByClient(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/client/${clientId}`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("create()", () => {
    it("should create new vehicle", (done) => {
      const newVehicle: Vehicle = {
        clientId: 10,
        licensePlate: "XYZ-9999",
        brand: "Yamaha",
        model: "MT-07",
        year: "2023",
        color: "Azul",
      };

      service.create(newVehicle).subscribe({
        next: (vehicle) => {
          expect(vehicle).toEqual(mockVehicle);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(newVehicle);
      req.flush(mockVehicle);
    });

    it("should handle validation errors on create", (done) => {
      const invalidVehicle: Vehicle = {
        clientId: 10,
        licensePlate: "", // Placa vazia
        brand: "",
        model: "",
      };

      service.create(invalidVehicle).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Validation failed", {
        status: 400,
        statusText: "Bad Request",
      });
    });

    it("should handle duplicate license plate error", (done) => {
      const duplicateVehicle: Vehicle = {
        clientId: 10,
        licensePlate: "ABC-1234", // Já existe
        brand: "Honda",
        model: "CB 500",
      };

      service.create(duplicateVehicle).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("License plate already exists", {
        status: 409,
        statusText: "Conflict",
      });
    });

    it("should handle non-existent client error", (done) => {
      const vehicleInvalidClient: Vehicle = {
        clientId: 9999,
        licensePlate: "NEW-1234",
        brand: "Honda",
        model: "CB 500",
      };

      service.create(vehicleInvalidClient).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("update()", () => {
    it("should update existing vehicle", (done) => {
      const vehicleId = 1;
      const updates: Vehicle = {
        clientId: 10,
        licensePlate: "ABC-1234",
        brand: "Honda",
        model: "CB 500",
        currentMileage: 20000,
      };

      service.update(vehicleId, updates).subscribe({
        next: (vehicle) => {
          expect(vehicle).toEqual(mockVehicle);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockVehicle);
    });

    it("should handle update of non-existent vehicle", (done) => {
      const vehicleId = 999;
      const updates: Vehicle = {
        clientId: 10,
        licensePlate: "ABC-1234",
        brand: "Honda",
        model: "CB 500",
      };

      service.update(vehicleId, updates).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      req.flush("Vehicle not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("delete()", () => {
    it("should delete vehicle", (done) => {
      const vehicleId = 1;

      service.delete(vehicleId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("should handle delete of non-existent vehicle", (done) => {
      const vehicleId = 999;

      service.delete(vehicleId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}`);
      req.flush("Vehicle not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("toggleStatus()", () => {
    it("should toggle vehicle status", (done) => {
      const vehicleId = 1;

      service.toggleStatus(vehicleId).subscribe({
        next: (vehicle) => {
          expect(vehicle).toEqual(mockVehicle);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockVehicle);
    });

    it("should handle toggle of non-existent vehicle", (done) => {
      const vehicleId = 999;

      service.toggleStatus(vehicleId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${vehicleId}/toggle-status`);
      req.flush("Vehicle not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("getActiveVehicles()", () => {
    it("should get count of active vehicles", (done) => {
      const count = 150;

      service.getActiveVehicles().subscribe({
        next: (result) => {
          expect(result).toBe(count);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe("GET");
      req.flush(count);
    });

    it("should handle zero active vehicles", (done) => {
      service.getActiveVehicles().subscribe({
        next: (result) => {
          expect(result).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      req.flush(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle vehicle with minimal required fields", (done) => {
      const minimalVehicle: Vehicle = {
        id: 2,
        clientId: 10,
        licensePlate: "MIN-0001",
        brand: "Test",
        model: "Model",
        active: true,
      };

      service.findById(2).subscribe({
        next: (vehicle) => {
          expect(vehicle.year).toBeUndefined();
          expect(vehicle.color).toBeUndefined();
          expect(vehicle.notes).toBeUndefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/2`);
      req.flush(minimalVehicle);
    });

    it("should handle special characters in search", (done) => {
      const specialSearch = "CB-500 (2022)";

      service.findAll(0, 20, specialSearch).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=${encodeURIComponent(specialSearch)}`,
      );
      req.flush(mockPage);
    });

    it("should handle very high mileage values", (done) => {
      const highMileageVehicle: Vehicle = {
        ...mockVehicle,
        currentMileage: 999999,
      };

      service.findById(1).subscribe({
        next: (vehicle) => {
          expect(vehicle.currentMileage).toBe(999999);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(highMileageVehicle);
    });

    it("should handle license plate with different formats", (done) => {
      const mercosulPlate = "ABC1D23";

      service.findByLicensePlate(mercosulPlate).subscribe({
        next: (vehicle) => {
          expect(vehicle).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/license-plate/${mercosulPlate}`,
      );
      req.flush(mockVehicle);
    });
  });
});
