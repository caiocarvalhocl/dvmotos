import { DemoBackend, DemoRequest } from "./demo-backend";
import { DEMO_CREDENTIALS } from "./demo-data";

describe("DemoBackend", () => {
  let backend: DemoBackend;

  const call = (
    method: string,
    path: string,
    options: Partial<DemoRequest> = {},
  ) =>
    backend.handle({
      method,
      path,
      params: {},
      body: undefined,
      authorization: "Bearer demo-token-1",
      ...options,
    });

  beforeEach(() => {
    backend = new DemoBackend();
  });

  describe("auth", () => {
    it("logs in with the demo credentials", () => {
      const res = call("POST", "/auth/login", {
        body: DEMO_CREDENTIALS,
        authorization: null,
      });

      expect(res.status).toBe(200);
      const body = res.body as { token: string; user: Record<string, unknown> };
      expect(body.token).toContain("demo-token");
      expect(body.user["role"]).toBe("ADMIN");
      expect(body.user["password"]).toBeUndefined();
    });

    it("rejects invalid credentials", () => {
      const res = call("POST", "/auth/login", {
        body: { email: DEMO_CREDENTIALS.email, password: "wrong" },
        authorization: null,
      });

      expect(res.status).toBe(401);
    });

    it("returns 401 for protected routes without a token", () => {
      expect(call("GET", "/clients", { authorization: null }).status).toBe(401);
    });
  });

  describe("clients", () => {
    it("paginates the list", () => {
      const res = call("GET", "/clients", { params: { page: "0", size: "3" } });
      const page = res.body as { content: unknown[]; totalElements: number; totalPages: number };

      expect(page.content.length).toBe(3);
      expect(page.totalElements).toBe(8);
      expect(page.totalPages).toBe(3);
    });

    it("filters by search term and active flag", () => {
      const search = call("GET", "/clients", { params: { search: "mariana" } });
      expect((search.body as { content: unknown[] }).content.length).toBe(1);

      const inactive = call("GET", "/clients", { params: { active: "false" } });
      expect((inactive.body as { totalElements: number }).totalElements).toBe(1);
    });

    it("creates, updates, toggles and deletes a client", () => {
      const created = call("POST", "/clients", {
        body: { name: "Novo Cliente", email: "novo@example.com" },
      });
      expect(created.status).toBe(201);
      const { id } = created.body as { id: number };

      const updated = call("PUT", `/clients/${id}`, { body: { name: "Renomeado" } });
      expect((updated.body as { name: string }).name).toBe("Renomeado");

      const toggled = call("PATCH", `/clients/${id}/toggle-status`);
      expect((toggled.body as { active: boolean }).active).toBeFalse();

      expect(call("DELETE", `/clients/${id}`).status).toBe(204);
      expect(call("GET", `/clients/${id}`).status).toBe(404);
    });

    it("rejects a duplicated e-mail", () => {
      const res = call("POST", "/clients", {
        body: { name: "Dup", email: "carlos.almeida@example.com" },
      });

      expect(res.status).toBe(400);
    });

    it("counts only active clients", () => {
      expect(call("GET", "/clients/count").body).toBe(7);
    });
  });

  describe("vehicles", () => {
    it("lists the vehicles of a client", () => {
      const res = call("GET", "/vehicles/client/1");

      expect((res.body as unknown[]).length).toBe(2);
    });

    it("rejects a duplicated license plate", () => {
      const res = call("POST", "/vehicles", {
        body: { clientId: 1, licensePlate: "abc1d23", brand: "X", model: "Y" },
      });

      expect(res.status).toBe(400);
    });
  });

  describe("products and stock", () => {
    it("reports low stock products", () => {
      const res = call("GET", "/products/low-stock/count");

      expect((res.body as { count: number }).count).toBeGreaterThan(0);
    });

    it("registers a stock entry and records the movement", () => {
      const before = (call("GET", "/products/1").body as { stockQuantity: number })
        .stockQuantity;

      const res = call("POST", "/products/1/stock", {
        body: { type: "IN", quantity: 5, reason: "teste" },
      });
      expect(res.status).toBe(201);

      const after = (call("GET", "/products/1").body as { stockQuantity: number })
        .stockQuantity;
      expect(after).toBe(before + 5);

      const history = call("GET", "/products/1/stock/history");
      expect((history.body as { totalElements: number }).totalElements).toBe(3);
    });

    it("refuses an output larger than the stock", () => {
      const res = call("POST", "/products/1/stock", {
        body: { type: "OUT", quantity: 9999 },
      });

      expect(res.status).toBe(400);
    });
  });

  describe("service orders", () => {
    it("filters by status and counts by status", () => {
      const list = call("GET", "/service-orders", { params: { status: "OPEN" } });
      const count = call("GET", "/service-orders/count", { params: { status: "OPEN" } });

      expect((list.body as { totalElements: number }).totalElements).toBe(2);
      expect((count.body as { count: number }).count).toBe(2);
    });

    it("creates an order and recalculates totals when items change", () => {
      const created = call("POST", "/service-orders", {
        body: { clientId: 1, vehicleId: 1, discountAmount: 10 },
      });
      const order = created.body as { id: number; clientName: string; totalAmount: number };
      expect(order.clientName).toBe("Carlos Almeida");
      expect(order.totalAmount).toBe(-10);

      const withItem = call("POST", `/service-orders/${order.id}/items`, {
        body: { type: "SERVICE", description: "Revisão", quantity: 2, unitPrice: 100 },
      });
      const updated = withItem.body as {
        servicesAmount: number;
        totalAmount: number;
        items: { id: number }[];
      };
      expect(updated.servicesAmount).toBe(200);
      expect(updated.totalAmount).toBe(190);

      const removed = call(
        "DELETE",
        `/service-orders/${order.id}/items/${updated.items[0].id}`,
      );
      expect((removed.body as { totalAmount: number }).totalAmount).toBe(-10);
    });

    it("changes the status and stamps completion", () => {
      const res = call("PATCH", "/service-orders/1/status", {
        body: { status: "COMPLETED" },
      });
      const order = res.body as { status: string; completedAt?: string };

      expect(order.status).toBe("COMPLETED");
      expect(order.completedAt).toBeDefined();
    });
  });

  it("restores the seed data on reset", () => {
    call("DELETE", "/clients/1");
    backend.reset();

    expect(call("GET", "/clients/1").status).toBe(200);
  });
});
