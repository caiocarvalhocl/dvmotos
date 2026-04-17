import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ClientService, Client } from "../client.service";
import { Page } from "@shared/types/Page";
import { environment } from "@env/environment";

describe("ClientService", () => {
  let service: ClientService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/clients`;

  const mockClient: Client = {
    id: 1,
    name: "John Doe",
    documentNumber: "12345678900",
    phone: "(41) 99999-9999",
    email: "john@example.com",
    address: "Rua Teste, 123",
    city: "Curitiba",
    state: "PR",
    zipCode: "80000-000",
    notes: "Cliente VIP",
    active: true,
    createdAt: "2024-01-01T00:00:00",
    totalVehicles: 2,
  };

  const mockPage: Page<Client> = {
    content: [mockClient],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientService],
    });

    service = TestBed.inject(ClientService);
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
    it("should fetch all clients with default pagination", (done) => {
      service.findAll().subscribe({
        next: (page) => {
          expect(page).toEqual(mockPage);
          expect(page.content.length).toBe(1);
          expect(page.content[0]).toEqual(mockClient);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch clients with custom pagination", (done) => {
      service.findAll(2, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=2&size=10`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch clients with search parameter", (done) => {
      const searchTerm = "John";

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

    it("should fetch only active clients", (done) => {
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

    it("should fetch only inactive clients", (done) => {
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

    it("should fetch all clients when active is null", (done) => {
      service.findAll(0, 20, undefined, null).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      expect(req.request.params.has("active")).toBeFalse();
      req.flush(mockPage);
    });

    it("should combine search and active filters", (done) => {
      service.findAll(0, 20, "John", true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=John&active=true`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should handle empty result set", (done) => {
      const emptyPage: Page<Client> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
      };

      service.findAll().subscribe({
        next: (page) => {
          expect(page.content.length).toBe(0);
          expect(page.totalElements).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      req.flush(emptyPage);
    });
  });

  describe("findById()", () => {
    it("should fetch client by id", (done) => {
      const clientId = 1;

      service.findById(clientId).subscribe({
        next: (client) => {
          expect(client).toEqual(mockClient);
          expect(client.id).toBe(clientId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockClient);
    });

    it("should handle client not found error", (done) => {
      const clientId = 999;

      service.findById(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("create()", () => {
    it("should create new client", (done) => {
      const newClient: Client = {
        name: "Jane Doe",
        documentNumber: "98765432100",
        phone: "(41) 88888-8888",
        email: "jane@example.com",
        address: "Av. Principal, 456",
        city: "Curitiba",
        state: "PR",
        zipCode: "80010-000",
      };

      service.create(newClient).subscribe({
        next: (client) => {
          expect(client).toEqual(mockClient);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(newClient);
      req.flush(mockClient);
    });

    it("should handle validation errors on create", (done) => {
      const invalidClient: Client = {
        name: "", // Nome vazio
        documentNumber: "123", // CPF inválido
      };

      service.create(invalidClient).subscribe({
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

    it("should handle duplicate document number error", (done) => {
      const duplicateClient: Client = {
        name: "Test",
        documentNumber: "12345678900", // Já existe
      };

      service.create(duplicateClient).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Document number already exists", {
        status: 409,
        statusText: "Conflict",
      });
    });
  });

  describe("update()", () => {
    it("should update existing client", (done) => {
      const clientId = 1;
      const updates: Client = {
        name: "John Doe Updated",
        documentNumber: "12345678900",
        phone: "(41) 77777-7777",
      };

      service.update(clientId, updates).subscribe({
        next: (client) => {
          expect(client).toEqual(mockClient);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockClient);
    });

    it("should handle update of non-existent client", (done) => {
      const clientId = 999;
      const updates: Client = {
        name: "Test",
        documentNumber: "12345678900",
      };

      service.update(clientId, updates).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("delete()", () => {
    it("should delete client", (done) => {
      const clientId = 1;

      service.delete(clientId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("should handle delete of non-existent client", (done) => {
      const clientId = 999;

      service.delete(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });

    it("should handle delete with associated vehicles error", (done) => {
      const clientId = 1;

      service.delete(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      req.flush("Cannot delete client with associated vehicles", {
        status: 409,
        statusText: "Conflict",
      });
    });
  });

  describe("activate()", () => {
    it("should activate client", (done) => {
      const clientId = 1;

      service.activate(clientId).subscribe({
        next: (client) => {
          expect(client).toEqual(mockClient);
          expect(client.active).toBeTrue();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}/activate`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockClient);
    });

    it("should handle activation of non-existent client", (done) => {
      const clientId = 999;

      service.activate(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}/activate`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("toggleStatus()", () => {
    it("should toggle client status", (done) => {
      const clientId = 1;

      service.toggleStatus(clientId).subscribe({
        next: (client) => {
          expect(client).toEqual(mockClient);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockClient);
    });

    it("should handle toggle of non-existent client", (done) => {
      const clientId = 999;

      service.toggleStatus(clientId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}/toggle-status`);
      req.flush("Client not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("getActiveClients()", () => {
    it("should get count of active clients", (done) => {
      const count = 42;

      service.getActiveClients().subscribe({
        next: (result) => {
          expect(result).toBe(count);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/count`);
      expect(req.request.method).toBe("GET");
      req.flush(count);
    });

    it("should handle zero active clients", (done) => {
      service.getActiveClients().subscribe({
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
    it("should handle empty search string", (done) => {
      service.findAll(0, 20, "").subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      req.flush(mockPage);
    });

    it("should handle special characters in search", (done) => {
      const specialSearch = "José & Maria";

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

    it("should handle client with all optional fields null", (done) => {
      const minimalClient: Client = {
        id: 2,
        name: "Minimal Client",
        active: true,
      };

      service.findById(2).subscribe({
        next: (client) => {
          expect(client.name).toBe("Minimal Client");
          expect(client.email).toBeUndefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/2`);
      req.flush(minimalClient);
    });

    it("should handle network timeout error", (done) => {
      service.findAll().subscribe({
        error: (error) => {
          expect(error.error).toBeDefined();
          expect(error.status).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      req.error(new ProgressEvent("timeout"), {
        status: 0,
        statusText: "Unknown Error",
      });
    });
  });
});
