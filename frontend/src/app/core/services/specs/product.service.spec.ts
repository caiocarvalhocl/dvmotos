import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  ProductService,
  Product,
  StockMovement,
  Page,
} from "../product.service";
import { environment } from "@env/environment";

describe("ProductService", () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  const mockProduct: Product = {
    id: 1,
    name: "Óleo Motor 10W40",
    description: "Óleo sintético para motor",
    barcode: "7891234567890",
    categoryId: 5,
    categoryName: "Lubrificantes",
    costPrice: 35.5,
    salePrice: 59.9,
    stockQuantity: 50,
    minimumStock: 10,
    unit: "UN",
    active: true,
    lowStock: false,
    createdAt: "2024-01-01T00:00:00",
  };

  const mockStockMovement: StockMovement = {
    id: 1,
    productId: 1,
    productName: "Óleo Motor 10W40",
    type: "IN",
    quantity: 20,
    previousQuantity: 30,
    newQuantity: 50,
    reason: "Reposição de estoque",
    userName: "Admin",
    createdAt: "2024-01-01T00:00:00",
  };

  const mockPage: Page<Product> = {
    content: [mockProduct],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  const mockMovementPage: Page<StockMovement> = {
    content: [mockStockMovement],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService],
    });

    service = TestBed.inject(ProductService);
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
    it("should fetch all products with default pagination", (done) => {
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

    it("should fetch products with custom pagination", (done) => {
      service.findAll(1, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&size=10`);
      req.flush(mockPage);
    });

    it("should fetch products with search parameter", (done) => {
      const searchTerm = "Óleo";

      service.findAll(0, 20, searchTerm).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        (req) =>
          req.url.includes("/products") &&
          req.params.get("search") === searchTerm,
      );
      req.flush(mockPage);
    });

    it("should fetch only active products", (done) => {
      service.findAll(0, 20, undefined, true).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=true`);
      req.flush(mockPage);
    });

    it("should fetch only inactive products", (done) => {
      service.findAll(0, 20, undefined, false).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&active=false`);
      req.flush(mockPage);
    });

    it("should fetch all products when active is null", (done) => {
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
  });

  describe("findById()", () => {
    it("should fetch product by id", (done) => {
      const productId = 1;

      service.findById(productId).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockProduct);
    });

    it("should handle product not found error", (done) => {
      const productId = 999;

      service.findById(productId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush("Product not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("findByBarcode()", () => {
    it("should fetch product by barcode", (done) => {
      const barcode = "7891234567890";

      service.findByBarcode(barcode).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          expect(product.barcode).toBe(barcode);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/barcode/${barcode}`);
      expect(req.request.method).toBe("GET");
      req.flush(mockProduct);
    });

    it("should handle barcode not found", (done) => {
      const barcode = "0000000000000";

      service.findByBarcode(barcode).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/barcode/${barcode}`);
      req.flush("Product not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("findLowStock()", () => {
    it("should fetch products with low stock", (done) => {
      const lowStockProducts = [
        { ...mockProduct, stockQuantity: 5, lowStock: true },
        { ...mockProduct, id: 2, stockQuantity: 3, lowStock: true },
      ];

      service.findLowStock().subscribe({
        next: (products) => {
          expect(products.length).toBe(2);
          expect(products.every((p) => p.lowStock)).toBeTrue();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/low-stock`);
      expect(req.request.method).toBe("GET");
      req.flush(lowStockProducts);
    });

    it("should return empty array when no low stock products", (done) => {
      service.findLowStock().subscribe({
        next: (products) => {
          expect(products.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/low-stock`);
      req.flush([]);
    });
  });

  describe("countLowStock()", () => {
    it("should get count of low stock products", (done) => {
      const count = { count: 15 };

      service.countLowStock().subscribe({
        next: (result) => {
          expect(result.count).toBe(15);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/low-stock/count`);
      expect(req.request.method).toBe("GET");
      req.flush(count);
    });

    it("should handle zero low stock products", (done) => {
      service.countLowStock().subscribe({
        next: (result) => {
          expect(result.count).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/low-stock/count`);
      req.flush({ count: 0 });
    });
  });

  describe("create()", () => {
    it("should create new product", (done) => {
      const newProduct: Product = {
        name: "Filtro de Óleo",
        description: "Filtro compatível com Honda",
        barcode: "7891234567891",
        categoryId: 3,
        salePrice: 45.0,
        stockQuantity: 30,
        minimumStock: 5,
        unit: "UN",
      };

      service.create(newProduct).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockProduct);
    });

    it("should handle validation errors on create", (done) => {
      const invalidProduct: Product = {
        name: "",
        salePrice: -10,
        stockQuantity: -5,
      };

      service.create(invalidProduct).subscribe({
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

    it("should handle duplicate barcode error", (done) => {
      const duplicateProduct: Product = {
        name: "Test",
        barcode: "7891234567890",
        salePrice: 10,
        stockQuantity: 5,
      };

      service.create(duplicateProduct).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush("Barcode already exists", {
        status: 409,
        statusText: "Conflict",
      });
    });
  });

  describe("update()", () => {
    it("should update existing product", (done) => {
      const productId = 1;
      const updates: Product = {
        name: "Óleo Motor 10W40 - Atualizado",
        salePrice: 64.9,
        stockQuantity: 60,
      };

      service.update(productId, updates).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(updates);
      req.flush(mockProduct);
    });

    it("should handle update of non-existent product", (done) => {
      const productId = 999;

      service.update(productId, mockProduct).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush("Product not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("delete()", () => {
    it("should delete product", (done) => {
      const productId = 1;

      service.delete(productId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("should handle delete of non-existent product", (done) => {
      const productId = 999;

      service.delete(productId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush("Product not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("toggleStatus()", () => {
    it("should toggle product status", (done) => {
      const productId = 1;

      service.toggleStatus(productId).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/toggle-status`);
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual({});
      req.flush(mockProduct);
    });
  });

  // ==================== STOCK MOVEMENT TESTS ====================

  describe("addStockMovement()", () => {
    it("should add IN stock movement", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "IN",
        quantity: 20,
        reason: "Compra de fornecedor",
      };

      service.addStockMovement(productId, movement).subscribe({
        next: (result) => {
          expect(result).toEqual(mockStockMovement);
          expect(result.type).toBe("IN");
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(movement);
      req.flush(mockStockMovement);
    });

    it("should add OUT stock movement", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "OUT",
        quantity: 5,
        reason: "Venda ao cliente",
      };

      const outMovement: StockMovement = {
        ...mockStockMovement,
        type: "OUT",
        quantity: 5,
        previousQuantity: 50,
        newQuantity: 45,
      };

      service.addStockMovement(productId, movement).subscribe({
        next: (result) => {
          expect(result.type).toBe("OUT");
          expect(result.quantity).toBe(5);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      req.flush(outMovement);
    });

    it("should add ADJUSTMENT stock movement", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "ADJUSTMENT",
        quantity: -3,
        reason: "Correção de inventário",
      };

      const adjustmentMovement: StockMovement = {
        ...mockStockMovement,
        type: "ADJUSTMENT",
        quantity: -3,
      };

      service.addStockMovement(productId, movement).subscribe({
        next: (result) => {
          expect(result.type).toBe("ADJUSTMENT");
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      req.flush(adjustmentMovement);
    });

    it("should handle insufficient stock error on OUT", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "OUT",
        quantity: 1000,
      };

      service.addStockMovement(productId, movement).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      req.flush("Insufficient stock", {
        status: 400,
        statusText: "Bad Request",
      });
    });

    it("should handle negative quantity error", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "IN",
        quantity: -10,
      };

      service.addStockMovement(productId, movement).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      req.flush("Quantity must be positive", {
        status: 400,
        statusText: "Bad Request",
      });
    });
  });

  describe("getStockHistory()", () => {
    it("should fetch stock movement history with default pagination", (done) => {
      const productId = 1;

      service.getStockHistory(productId).subscribe({
        next: (page) => {
          expect(page).toEqual(mockMovementPage);
          expect(page.content.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${productId}/stock/history?page=0&size=20`,
      );
      expect(req.request.method).toBe("GET");
      req.flush(mockMovementPage);
    });

    it("should fetch stock history with custom pagination", (done) => {
      const productId = 1;

      service.getStockHistory(productId, 2, 10).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${productId}/stock/history?page=2&size=10`,
      );
      req.flush(mockMovementPage);
    });

    it("should handle empty stock history", (done) => {
      const productId = 1;
      const emptyPage: Page<StockMovement> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
      };

      service.getStockHistory(productId).subscribe({
        next: (page) => {
          expect(page.content.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${productId}/stock/history?page=0&size=20`,
      );
      req.flush(emptyPage);
    });

    it("should handle product not found in history", (done) => {
      const productId = 999;

      service.getStockHistory(productId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${productId}/stock/history?page=0&size=20`,
      );
      req.flush("Product not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle product with zero stock", (done) => {
      const zeroStockProduct: Product = {
        ...mockProduct,
        stockQuantity: 0,
        lowStock: true,
      };

      service.findById(1).subscribe({
        next: (product) => {
          expect(product.stockQuantity).toBe(0);
          expect(product.lowStock).toBeTrue();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(zeroStockProduct);
    });

    it("should handle product without category", (done) => {
      const noCategoryProduct: Product = {
        ...mockProduct,
        categoryId: undefined,
        categoryName: undefined,
      };

      service.findById(1).subscribe({
        next: (product) => {
          expect(product.categoryId).toBeUndefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(noCategoryProduct);
    });

    it("should handle very long product names in search", (done) => {
      const longSearch = "A".repeat(200);

      service.findAll(0, 20, longSearch).subscribe({
        next: (page) => {
          expect(page).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=20&search=${encodeURIComponent(longSearch)}`,
      );
      req.flush(mockPage);
    });

    it("should handle decimal quantities in stock movements", (done) => {
      const productId = 1;
      const movement: Partial<StockMovement> = {
        type: "IN",
        quantity: 2.5,
        reason: "Produto vendido por peso",
      };

      service.addStockMovement(productId, movement).subscribe({
        next: (result) => {
          expect(result).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}/stock`);
      req.flush(mockStockMovement);
    });
  });
});
