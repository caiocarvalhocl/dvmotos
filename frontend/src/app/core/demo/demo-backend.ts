import type { Page } from "../../shared/types/Page";
import {
  createDemoDatabase,
  type DemoDatabase,
  type DemoUser,
} from "./demo-data";
import type {
  ServiceOrder,
  ServiceOrderItem,
  ServiceOrderStatus,
} from "../services/service-order.service";
import type { StockMovement } from "../services/product.service";

// Request bodies are arbitrary JSON coming from the app's own services.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonBody = any;

export interface DemoRequest {
  method: string;
  /** Path relative to the API root, e.g. "/clients/3". */
  path: string;
  params: Record<string, string | undefined>;
  body: JsonBody;
  /** Value of the Authorization header, when present. */
  authorization?: string | null;
}

export interface DemoResponse {
  status: number;
  body: unknown;
}

const ok = (body: unknown, status = 200): DemoResponse => ({ status, body });
const notFound = (what: string): DemoResponse => ({
  status: 404,
  body: { message: `${what} não encontrado(a)` },
});
const badRequest = (message: string): DemoResponse => ({
  status: 400,
  body: { message },
});

type Entity = { id?: number; active?: boolean };

/**
 * In-memory implementation of the DV Motos REST API used by the public demo.
 * Data lives only for the lifetime of the page; reloading restores the seed.
 */
export class DemoBackend {
  private db: DemoDatabase = createDemoDatabase();
  private nextId = {
    users: 100,
    categories: 100,
    clients: 100,
    vehicles: 100,
    products: 100,
    orders: 100,
    items: 1000,
    movements: 100,
  };

  /** Restores the seed data. Mostly useful in tests. */
  reset(): void {
    this.db = createDemoDatabase();
  }

  handle(req: DemoRequest): DemoResponse {
    const segments = req.path.split("/").filter(Boolean);
    const [resource, ...rest] = segments;
    const method = req.method.toUpperCase();

    if (resource === "auth") return this.auth(method, rest, req);

    if (!req.authorization) {
      return { status: 401, body: { message: "Não autenticado" } };
    }

    switch (resource) {
      case "users":
        return this.users(method, rest, req);
      case "categories":
        return this.categories(method, rest, req);
      case "clients":
        return this.clients(method, rest, req);
      case "vehicles":
        return this.vehicles(method, rest, req);
      case "products":
        return this.products(method, rest, req);
      case "service-orders":
        return this.orders(method, rest, req);
      default:
        return notFound("Recurso");
    }
  }

  // ---------------------------------------------------------------- auth

  private auth(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (method === "POST" && rest[0] === "login") {
      const { email, password } = req.body ?? {};
      const user = this.db.users.find(
        (u) => u.email.toLowerCase() === String(email).toLowerCase(),
      );
      if (!user || user.password !== password || user.active === false) {
        return { status: 401, body: { message: "Credenciais inválidas" } };
      }
      return ok(this.authResponse(user));
    }
    if (method === "POST" && rest[0] === "refresh") {
      return ok(this.authResponse(this.db.users[0]));
    }
    return notFound("Recurso");
  }

  private authResponse(user: DemoUser) {
    return {
      token: `demo-token-${user.id}`,
      refreshToken: `demo-refresh-${user.id}`,
      type: "Bearer",
      expiresIn: 3_600_000,
      user: this.publicUser(user),
    };
  }

  private publicUser(user: DemoUser): Omit<DemoUser, "password"> {
    const copy: Partial<DemoUser> = { ...user };
    delete copy.password;
    return copy as Omit<DemoUser, "password">;
  }

  private currentUser(req: DemoRequest): DemoUser {
    const id = Number(req.authorization?.match(/demo-token-(\d+)/)?.[1]);
    return this.db.users.find((u) => u.id === id) ?? this.db.users[0];
  }

  // --------------------------------------------------------------- users

  private users(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (rest[0] === "me") {
      const me = this.currentUser(req);
      if (method === "GET" && !rest[1]) return ok(this.publicUser(me));
      if (method === "PUT" && !rest[1]) {
        const { name, email } = req.body ?? {};
        if (name) me.name = name;
        if (email) me.email = email;
        return ok(this.publicUser(me));
      }
      if (method === "PATCH" && rest[1] === "password") {
        const { currentPassword, newPassword } = req.body ?? {};
        if (currentPassword !== me.password) {
          return badRequest("Senha atual incorreta");
        }
        me.password = newPassword;
        return ok(null, 204);
      }
      return notFound("Recurso");
    }

    return this.crud<DemoUser>(this.db.users, "users", "Usuário", method, rest, req, {
      view: (u) => this.publicUser(u),
      searchFields: (u) => [u.name, u.email],
      onCreate: (u) => {
        if (this.db.users.some((x) => x.email === u.email)) {
          return badRequest("E-mail já cadastrado");
        }
        u.password = u.password || "demo123";
        u.active = true;
        u.createdAt = new Date().toISOString();
        return null;
      },
      extra: (target, m, action, body) => {
        if (m === "PATCH" && action === "password") {
          target.password = body?.password;
          return ok(null, 204);
        }
        return null;
      },
    });
  }

  // ---------------------------------------------------------- categories

  private categories(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (method === "GET" && rest[0] === "active") {
      return ok(this.db.categories.filter((c) => c.active));
    }
    return this.crud(this.db.categories, "categories", "Categoria", method, rest, req, {
      view: (c) => ({
        ...c,
        totalProducts: this.db.products.filter((p) => p.categoryId === c.id).length,
      }),
      searchFields: (c) => [c.name, c.description],
      onCreate: (c) => {
        c.active = true;
        c.createdAt = new Date().toISOString();
        return null;
      },
    });
  }

  // ------------------------------------------------------------- clients

  private clients(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (method === "GET" && rest[0] === "count") {
      return ok(this.db.clients.filter((c) => c.active).length);
    }
    return this.crud(this.db.clients, "clients", "Cliente", method, rest, req, {
      view: (c) => ({
        ...c,
        totalVehicles: this.db.vehicles.filter((v) => v.clientId === c.id).length,
      }),
      searchFields: (c) => [c.name, c.email, c.phone, c.documentNumber],
      onCreate: (c) => {
        if (c.email && this.db.clients.some((x) => x.email === c.email)) {
          return badRequest("E-mail já cadastrado");
        }
        c.active = true;
        c.createdAt = new Date().toISOString();
        return null;
      },
    });
  }

  // ------------------------------------------------------------ vehicles

  private vehicles(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (method === "GET" && rest[0] === "count") {
      return ok(this.db.vehicles.filter((v) => v.active).length);
    }
    if (method === "GET" && rest[0] === "license-plate") {
      const plate = decodeURIComponent(rest[1] ?? "").toUpperCase();
      const found = this.db.vehicles.find((v) => v.licensePlate === plate);
      return found ? ok(found) : notFound("Veículo");
    }
    if (method === "GET" && rest[0] === "client") {
      return ok(
        this.db.vehicles.filter((v) => v.clientId === Number(rest[1])),
      );
    }
    return this.crud(this.db.vehicles, "vehicles", "Veículo", method, rest, req, {
      view: (v) => ({
        ...v,
        clientName: this.db.clients.find((c) => c.id === v.clientId)?.name,
      }),
      searchFields: (v) => [v.licensePlate, v.brand, v.model, v.clientName],
      onCreate: (v) => {
        v.licensePlate = String(v.licensePlate ?? "").toUpperCase();
        if (this.db.vehicles.some((x) => x.licensePlate === v.licensePlate)) {
          return badRequest("Placa já cadastrada");
        }
        v.active = true;
        v.createdAt = new Date().toISOString();
        return null;
      },
    });
  }

  // ------------------------------------------------------------ products

  private products(method: string, rest: string[], req: DemoRequest): DemoResponse {
    const withStock = (p: (typeof this.db.products)[number]) => ({
      ...p,
      categoryName: this.db.categories.find((c) => c.id === p.categoryId)?.name,
      lowStock: p.stockQuantity <= (p.minimumStock ?? 0),
    });

    if (method === "GET" && rest[0] === "low-stock") {
      const low = this.db.products
        .filter((p) => p.active && p.stockQuantity <= (p.minimumStock ?? 0))
        .map(withStock);
      return rest[1] === "count" ? ok({ count: low.length }) : ok(low);
    }
    if (method === "GET" && rest[0] === "barcode") {
      const found = this.db.products.find((p) => p.barcode === rest[1]);
      return found ? ok(withStock(found)) : notFound("Produto");
    }

    const id = Number(rest[0]);
    if (rest[1] === "stock") {
      const product = this.db.products.find((p) => p.id === id);
      if (!product) return notFound("Produto");

      if (method === "GET" && rest[2] === "history") {
        const history = this.db.movements
          .filter((m) => m.productId === id)
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        return ok(this.paginate(history, req.params));
      }
      if (method === "POST" && !rest[2]) {
        const { type, quantity, reason } = req.body ?? {};
        const qty = Number(quantity);
        if (!qty || qty <= 0) return badRequest("Quantidade inválida");
        const previous = product.stockQuantity;
        let next = previous;
        if (type === "IN") next = previous + qty;
        else if (type === "OUT") next = previous - qty;
        else next = qty;
        if (next < 0) return badRequest("Estoque insuficiente");
        product.stockQuantity = next;
        product.lowStock = next <= (product.minimumStock ?? 0);
        const movement: StockMovement = {
          id: this.nextId.movements++,
          productId: id,
          productName: product.name,
          type,
          quantity: qty,
          previousQuantity: previous,
          newQuantity: next,
          reason,
          userName: this.currentUser(req).name,
          createdAt: new Date().toISOString(),
        };
        this.db.movements.push(movement);
        return ok(movement, 201);
      }
      return notFound("Recurso");
    }

    return this.crud(this.db.products, "products", "Produto", method, rest, req, {
      view: withStock,
      searchFields: (p) => [p.name, p.barcode, p.description],
      onCreate: (p) => {
        p.active = true;
        p.stockQuantity = Number(p.stockQuantity ?? 0);
        p.createdAt = new Date().toISOString();
        return null;
      },
    });
  }

  // -------------------------------------------------------------- orders

  private orders(method: string, rest: string[], req: DemoRequest): DemoResponse {
    if (method === "GET" && rest[0] === "count") {
      const status = req.params["status"];
      return ok({
        count: this.db.orders.filter((o) => !status || o.status === status).length,
      });
    }
    if (method === "GET" && rest[0] === "vehicle") {
      const list = this.db.orders.filter((o) => o.vehicleId === Number(rest[1]));
      return ok(this.paginate(list, req.params));
    }

    if (method === "GET" && !rest[0]) {
      const term = (req.params["search"] ?? "").toLowerCase();
      const status = req.params["status"];
      const list = this.db.orders
        .filter((o) => !status || o.status === status)
        .filter(
          (o) =>
            !term ||
            [String(o.id), o.clientName, o.vehiclePlate, o.vehicleModel].some((f) =>
              (f ?? "").toLowerCase().includes(term),
            ),
        )
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      return ok(this.paginate(list, req.params));
    }

    if (method === "POST" && !rest[0]) {
      const body = req.body ?? {};
      const order: ServiceOrder = {
        id: this.nextId.orders++,
        clientId: body.clientId,
        vehicleId: body.vehicleId,
        status: "OPEN",
        entryMileage: body.entryMileage,
        notes: body.notes,
        discountAmount: body.discountAmount ?? 0,
        items: (body.items ?? []).map((i: ServiceOrderItem) => this.newItem(i)),
        userId: this.currentUser(req).id,
        userName: this.currentUser(req).name,
        createdAt: new Date().toISOString(),
      };
      this.recalculate(order);
      this.db.orders.push(order);
      return ok(order, 201);
    }

    const order = this.db.orders.find((o) => o.id === Number(rest[0]));
    if (!order) return notFound("Ordem de serviço");

    if (method === "GET" && !rest[1]) return ok(order);

    if (method === "PUT" && !rest[1]) {
      const body = req.body ?? {};
      Object.assign(order, {
        clientId: body.clientId ?? order.clientId,
        vehicleId: body.vehicleId ?? order.vehicleId,
        entryMileage: body.entryMileage ?? order.entryMileage,
        notes: body.notes ?? order.notes,
        discountAmount: body.discountAmount ?? order.discountAmount,
      });
      this.recalculate(order);
      return ok(order);
    }

    if (rest[1] === "items") {
      if (method === "POST") {
        order.items = [...(order.items ?? []), this.newItem(req.body)];
        this.recalculate(order);
        return ok(order, 201);
      }
      if (method === "DELETE") {
        order.items = (order.items ?? []).filter((i) => i.id !== Number(rest[2]));
        this.recalculate(order);
        return ok(order);
      }
    }

    if (method === "PATCH" && rest[1] === "status") {
      const status = req.body?.status as ServiceOrderStatus;
      order.status = status;
      order.completedAt =
        status === "COMPLETED" ? new Date().toISOString() : undefined;
      return ok(order);
    }

    return notFound("Recurso");
  }

  private newItem(item: ServiceOrderItem): ServiceOrderItem {
    return {
      ...item,
      id: this.nextId.items++,
      totalPrice: item.quantity * item.unitPrice,
    };
  }

  private recalculate(order: ServiceOrder): void {
    const client = this.db.clients.find((c) => c.id === order.clientId);
    const vehicle = this.db.vehicles.find((v) => v.id === order.vehicleId);
    order.clientName = client?.name;
    order.vehiclePlate = vehicle?.licensePlate;
    order.vehicleModel = vehicle ? `${vehicle.brand} ${vehicle.model}` : undefined;
    const items = order.items ?? [];
    order.servicesAmount = items
      .filter((i) => i.type === "SERVICE")
      .reduce((s, i) => s + (i.totalPrice ?? 0), 0);
    order.partsAmount = items
      .filter((i) => i.type === "PART")
      .reduce((s, i) => s + (i.totalPrice ?? 0), 0);
    order.totalAmount =
      order.servicesAmount + order.partsAmount - (order.discountAmount ?? 0);
  }

  // ------------------------------------------------------------- helpers

  private paginate<T>(list: T[], params: DemoRequest["params"]): Page<T> {
    const size = Math.max(Number(params["size"] ?? 20), 1);
    const number = Math.max(Number(params["page"] ?? 0), 0);
    return {
      content: list.slice(number * size, number * size + size),
      totalElements: list.length,
      totalPages: Math.max(Math.ceil(list.length / size), 1),
      size,
      number,
    };
  }

  /**
   * Generic REST resource: list/search/filter, get, create, update, delete
   * and the status actions shared by most entities.
   */
  private crud<T extends Entity>(
    list: T[],
    key: keyof typeof this.nextId,
    label: string,
    method: string,
    rest: string[],
    req: DemoRequest,
    opts: {
      view: (entity: T) => unknown;
      searchFields: (entity: T) => (string | undefined)[];
      onCreate: (entity: T) => DemoResponse | null;
      extra?: (
        target: T,
        method: string,
        action: string | undefined,
        body: JsonBody,
      ) => DemoResponse | null;
    },
  ): DemoResponse {
    if (method === "GET" && !rest[0]) {
      const term = (req.params["search"] ?? "").toLowerCase();
      const active = req.params["active"];
      const filtered = list
        .map((e) => opts.view(e) as T)
        .filter((e) => active === undefined || String(!!e.active) === active)
        .filter(
          (e) =>
            !term ||
            opts.searchFields(e).some((f) => (f ?? "").toLowerCase().includes(term)),
        );
      return ok(this.paginate(filtered, req.params));
    }

    if (method === "POST" && !rest[0]) {
      const entity = { ...(req.body ?? {}), id: this.nextId[key]++ } as T;
      const error = opts.onCreate(entity);
      if (error) return error;
      list.push(entity);
      return ok(opts.view(entity), 201);
    }

    const id = Number(rest[0]);
    const target = list.find((e) => e.id === id);
    if (!target) return notFound(label);
    const action = rest[1];

    if (method === "GET" && !action) return ok(opts.view(target));
    if (method === "PUT" && !action) {
      Object.assign(target, req.body ?? {}, { id });
      return ok(opts.view(target));
    }
    if (method === "DELETE" && !action) {
      list.splice(list.indexOf(target), 1);
      return ok(null, 204);
    }
    if (method === "PATCH" && action === "toggle-status") {
      target.active = !target.active;
      return ok(opts.view(target));
    }
    if (method === "PATCH" && action === "activate") {
      target.active = true;
      return ok(opts.view(target));
    }
    return opts.extra?.(target, method, action, req.body) ?? notFound("Recurso");
  }
}
