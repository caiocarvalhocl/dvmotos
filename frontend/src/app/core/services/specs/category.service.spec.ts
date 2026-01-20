import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CategoryService, Category, Page } from "../category.service";
import { environment } from "@env/environment";

describe("CategoryService", () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/categories`;

  const mockCategory: Category = {
    id: 1,
    name: "Lubrificantes",
    description: "Óleos e graxas para manutenção",
    active: true,
    totalProducts: 15,
    createdAt: "2024-01-01T00:00:00",
  };

  const mockPage: Page<Category> = {
    content: [mockCategory],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });

    service = TestBed.inject(CategoryService);
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
    it("should fetch all categories with default pagination", (done) => {
      service.findAll().subscribe({
        next: (page) => {
          expect(page).toEqual(mockPage);
          expect(page.content.length).toBe(1);
          expect(page.content[0]).toEqual(mockCategory);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should fetch categories with custom pagination", (done) => {
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

    it("should fetch categories with search parameter", (done) => {
      const searchTerm = "Lubrif";

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

    it("should fetch only active categories", (done) => {
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

    it("should fetch only inactive categories", (done) => {
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

    it("should fetch all categories when active is null", (done) => {
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
      service.findAll(0, 20, "Peças", true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=Pe%C3%A7as&active=true`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockPage);
    });

    it("should handle empty result set", (done) => {
      const emptyPage: Page<Category> = {
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

  describe("findAllActive()", () => {
    it("should fetch only active categories without pagination", (done) => {
      const activeCategories = [
        mockCategory,
        { ...mockCategory, id: 2, name: "Peças" },
        { ...mockCategory, id: 3, name: "Acessórios" },
      ];

      service.findAllActive().subscribe({
        next: (categories) => {
          expect(categories.length).toBe(3);
          expect(categories.every((c) => c.active)).toBeTrue();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/active`);
      expect(req.request.method).toBe("GET");
      req.flush(activeCategories);
    });

    it("should return empty array when no active categories", (done) => {
      service.findAllActive().subscribe({
        next: (categories) => {
          expect(categories.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/active`);
      req.flush([]);
    });

    it("should handle server error on active categories fetch", (done) => {
      service.findAllActive().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/active`);
      req.flush("Server error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    });
  });

  describe("findById()", () => {
    it("should fetch category by id", (done) => {
      const categoryId = 1;

      service.findById(categoryId).subscribe({
        next: (category) => {
          expect(category).toEqual(mockCategory);
          expect(category.id).toBe(categoryId);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockCategory);
    });

    it("should handle category not found error", (done) => {
      const categoryId = 999;

      service.findById(categoryId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Category not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("create()", () => {
    it("should create new category", (done) => {
      const newCategory: Category = {
        name: "Ferramentas",
        description: "Ferramentas para oficina",
      };

      service.create(newCategory).subscribe({
        next: (category) => {
          expect(category).toEqual(mockCategory);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(newCategory);
      req.flush(mockCategory);
    });

    it("should handle validation errors on create", (done) => {
      const invalidCategory: Category = {
        name: "", // Nome vazio
      };

      service.create(invalidCategory).subscribe({
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

    it("should handle duplicate category name error", (done) => {
      const duplicateCategory: Category = {
        name: "Lubrificantes", // Já existe
      };

      service.create(duplicateCategory).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Category name already exists", {
        status: 409,
        statusText: "Conflict",
      });
    });

    it("should create category without description", (done) => {
      const minimalCategory: Category = {
        name: "Categoria Simples",
      };

      service.create(minimalCategory).subscribe({
        next: (category) => {
          expect(category).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body).toEqual(minimalCategory);
      req.flush(mockCategory);
    });
  });

  describe("update()", () => {
    it("should update existing category", (done) => {
      const categoryId = 1;
      const updates: Category = {
        name: "Lubrificantes e Óleos",
        description: "Óleos, graxas e lubrificantes",
      };

      service.update(categoryId, updates).subscribe({
        next: (category) => {
          expect(category).toEqual(mockCategory);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockCategory);
    });

    it("should handle update of non-existent category", (done) => {
      const categoryId = 999;
      const updates: Category = {
        name: "Test",
      };

      service.update(categoryId, updates).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Category not found", { status: 404, statusText: "Not Found" });
    });

    it("should handle duplicate name on update", (done) => {
      const categoryId = 1;
      const updates: Category = {
        name: "Peças", // Nome que já existe em outra categoria
      };

      service.update(categoryId, updates).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Category name already exists", {
        status: 409,
        statusText: "Conflict",
      });
    });
  });

  describe("delete()", () => {
    it("should delete category", (done) => {
      const categoryId = 1;

      service.delete(categoryId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("should handle delete of non-existent category", (done) => {
      const categoryId = 999;

      service.delete(categoryId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Category not found", { status: 404, statusText: "Not Found" });
    });

    it("should handle delete with associated products error", (done) => {
      const categoryId = 1;

      service.delete(categoryId).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.error).toContain("associated products");
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Cannot delete category with associated products", {
        status: 409,
        statusText: "Conflict",
      });
    });
  });

  describe("toggleStatus()", () => {
    it("should toggle category status from active to inactive", (done) => {
      const categoryId = 1;
      const inactiveCategory = { ...mockCategory, active: false };

      service.toggleStatus(categoryId).subscribe({
        next: (category) => {
          expect(category).toEqual(inactiveCategory);
          expect(category.active).toBeFalse();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(inactiveCategory);
    });

    it("should toggle category status from inactive to active", (done) => {
      const categoryId = 1;

      service.toggleStatus(categoryId).subscribe({
        next: (category) => {
          expect(category).toEqual(mockCategory);
          expect(category.active).toBeTrue();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      req.flush(mockCategory);
    });

    it("should handle toggle of non-existent category", (done) => {
      const categoryId = 999;

      service.toggleStatus(categoryId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}/toggle-status`);
      req.flush("Category not found", { status: 404, statusText: "Not Found" });
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
      const specialSearch = "Peças & Acessórios";

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

    it("should handle category with zero products", (done) => {
      const emptyCategory: Category = {
        ...mockCategory,
        totalProducts: 0,
      };

      service.findById(1).subscribe({
        next: (category) => {
          expect(category.totalProducts).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(emptyCategory);
    });

    it("should handle very long category names", (done) => {
      const longNameCategory: Category = {
        id: 1,
        name: "A".repeat(200),
        active: true,
      };

      service.findById(1).subscribe({
        next: (category) => {
          expect(category.name.length).toBe(200);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(longNameCategory);
    });

    it("should handle category without totalProducts field", (done) => {
      const categoryNoTotal: Category = {
        id: 1,
        name: "Test",
        active: true,
      };

      service.findById(1).subscribe({
        next: (category) => {
          expect(category.totalProducts).toBeUndefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(categoryNoTotal);
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

    it("should handle unauthorized access", (done) => {
      service.findAll().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20`);
      req.flush("Unauthorized", { status: 401, statusText: "Unauthorized" });
    });

    it("should handle forbidden access", (done) => {
      const categoryId = 1;

      service.delete(categoryId).subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${categoryId}`);
      req.flush("Forbidden", { status: 403, statusText: "Forbidden" });
    });
  });

  describe("Multiple Sequential Calls", () => {
    it("should handle multiple findAll calls correctly", (done) => {
      let callCount = 0;

      const checkDone = () => {
        callCount++;
        if (callCount === 2) done();
      };

      // First call
      service.findAll(0, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          checkDone();
        },
      });

      // Second call
      service.findAll(1, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          checkDone();
        },
      });

      const requests = httpMock.match((req) => req.url.includes("/categories"));
      expect(requests.length).toBe(2);
      requests.forEach((req) => req.flush(mockPage));
    });
  });
});
