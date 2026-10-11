import type { Category } from "../services/category.service";
import type { Client } from "../services/client.service";
import type { Vehicle } from "../services/vehicle.service";
import type { Product, StockMovement } from "../services/product.service";
import type {
  ServiceOrder,
  ServiceOrderItem,
} from "../services/service-order.service";
import type { User } from "../services/user.service";

export interface DemoUser extends User {
  password: string;
}

export interface DemoDatabase {
  users: DemoUser[];
  categories: Category[];
  clients: Client[];
  vehicles: Vehicle[];
  products: Product[];
  orders: ServiceOrder[];
  movements: StockMovement[];
}

export const DEMO_CREDENTIALS = {
  email: "demo@dvmotos.com",
  password: "demo123",
};

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const item = (
  id: number,
  type: "SERVICE" | "PART",
  description: string,
  quantity: number,
  unitPrice: number,
  productId?: number,
): ServiceOrderItem => ({
  id,
  type,
  description,
  quantity,
  unitPrice,
  totalPrice: quantity * unitPrice,
  productId,
});

/** Fresh copy of the seed data. Called once per page load. */
export function createDemoDatabase(): DemoDatabase {
  const users: DemoUser[] = [
    {
      id: 1,
      name: "Administrador Demo",
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      role: "ADMIN",
      active: true,
      createdAt: daysAgo(120),
    },
    {
      id: 2,
      name: "Operador Demo",
      email: "operador@dvmotos.com",
      password: "demo123",
      role: "OPERADOR",
      active: true,
      createdAt: daysAgo(90),
    },
  ];

  const categories: Category[] = [
    { id: 1, name: "Lubrificantes", description: "Óleos e graxas", active: true },
    { id: 2, name: "Freios", description: "Pastilhas, discos e fluidos", active: true },
    { id: 3, name: "Transmissão", description: "Correntes, coroas e pinhões", active: true },
    { id: 4, name: "Elétrica", description: "Baterias, velas e lâmpadas", active: true },
  ].map((c) => ({ ...c, createdAt: daysAgo(100) }));

  const clients: Client[] = [
    ["Carlos Almeida", "carlos.almeida@example.com", "(11) 98888-1001", "São Paulo", "SP"],
    ["Mariana Souza", "mariana.souza@example.com", "(11) 98888-1002", "Osasco", "SP"],
    ["João Pereira", "joao.pereira@example.com", "(21) 97777-1003", "Rio de Janeiro", "RJ"],
    ["Fernanda Lima", "fernanda.lima@example.com", "(31) 96666-1004", "Belo Horizonte", "MG"],
    ["Ricardo Gomes", "ricardo.gomes@example.com", "(41) 95555-1005", "Curitiba", "PR"],
    ["Patrícia Rocha", "patricia.rocha@example.com", "(51) 94444-1006", "Porto Alegre", "RS"],
    ["Bruno Martins", "bruno.martins@example.com", "(11) 93333-1007", "Guarulhos", "SP"],
    ["Aline Barros", "aline.barros@example.com", "(19) 92222-1008", "Campinas", "SP"],
  ].map(([name, email, phone, city, state], i) => ({
    id: i + 1,
    name,
    email,
    phone,
    city,
    state,
    documentNumber: `000.000.000-${String(i + 10)}`,
    active: i !== 7,
    createdAt: daysAgo(80 - i * 5),
  }));

  const vehicleSeed: [number, string, string, string, string, string, number][] = [
    [1, "ABC1D23", "Honda", "CG 160", "2022", "Vermelha", 18500],
    [1, "BRA2E19", "Yamaha", "Fazer 250", "2021", "Azul", 32100],
    [2, "FGH4J56", "Honda", "CB 500F", "2020", "Preta", 27800],
    [3, "KLM7N89", "Suzuki", "Yes 125", "2019", "Prata", 41200],
    [4, "QRS1T34", "Yamaha", "MT-03", "2023", "Cinza", 6400],
    [5, "UVW5X67", "Honda", "Biz 125", "2018", "Branca", 52300],
    [6, "ZAB9C01", "Kawasaki", "Ninja 400", "2022", "Verde", 11900],
    [7, "DEF2G45", "Honda", "PCX 160", "2024", "Preta", 3100],
    [8, "HIJ6K78", "Yamaha", "XTZ 150", "2020", "Azul", 24700],
    [3, "LMN0P12", "BMW", "G 310 R", "2021", "Branca", 15800],
  ];
  const vehicles: Vehicle[] = vehicleSeed.map(
    ([clientId, licensePlate, brand, model, year, color, currentMileage], i) => ({
      id: i + 1,
      clientId,
      clientName: clients[clientId - 1].name,
      licensePlate,
      brand,
      model,
      year,
      color,
      currentMileage,
      active: true,
      createdAt: daysAgo(70 - i * 4),
    }),
  );
  clients.forEach((c) => {
    c.totalVehicles = vehicles.filter((v) => v.clientId === c.id).length;
  });

  const productSeed: [string, number, number, number, number, number][] = [
    ["Óleo Motul 10W40 1L", 1, 32, 54.9, 20, 4],
    ["Óleo Castrol Power1 20W50 1L", 1, 6, 39.9, 12, 24],
    ["Graxa de corrente", 1, 14, 24.5, 5, 8],
    ["Pastilha de freio dianteira CG", 2, 18, 59.9, 25, 6],
    ["Disco de freio traseiro CB 500", 2, 3, 189.0, 4, 8],
    ["Fluido de freio DOT 4", 2, 22, 19.9, 8, 6],
    ["Kit relação CG 160", 3, 5, 149.9, 8, 10],
    ["Corrente 428H 118L", 3, 9, 89.9, 6, 4],
    ["Bateria 12V 5Ah", 4, 7, 179.9, 5, 3],
    ["Vela NGK CR8E", 4, 40, 29.9, 10, 12],
    ["Lâmpada farol H4", 4, 2, 21.5, 6, 10],
    ["Filtro de ar PCX 160", 4, 11, 44.0, 4, 6],
    ["Cabo de acelerador", 3, 15, 22.0, 5, 6],
    ["Pneu traseiro 140/70-17", 3, 4, 349.9, 4, 4],
  ];
  const products: Product[] = productSeed.map(
    ([name, categoryId, costPrice, salePrice, stockQuantity, minimumStock], i) => ({
      id: i + 1,
      name,
      categoryId,
      categoryName: categories[categoryId - 1].name,
      costPrice,
      salePrice,
      stockQuantity,
      minimumStock,
      unit: "UN",
      barcode: `789000000${String(i + 1).padStart(4, "0")}`,
      active: true,
      lowStock: stockQuantity <= minimumStock,
      createdAt: daysAgo(60 - i),
    }),
  );
  categories.forEach((c) => {
    c.totalProducts = products.filter((p) => p.categoryId === c.id).length;
  });

  const orderSeed: {
    clientId: number;
    vehicleId: number;
    status: ServiceOrder["status"];
    daysAgo: number;
    items: ServiceOrderItem[];
    notes?: string;
    discount?: number;
  }[] = [
    {
      clientId: 1, vehicleId: 1, status: "OPEN", daysAgo: 1,
      items: [item(1, "SERVICE", "Revisão geral", 1, 180)],
      notes: "Cliente relatou barulho na corrente",
    },
    {
      clientId: 2, vehicleId: 3, status: "IN_PROGRESS", daysAgo: 2,
      items: [
        item(2, "SERVICE", "Troca de pastilhas", 1, 80),
        item(3, "PART", "Pastilha de freio dianteira CG", 1, 59.9, 4),
      ],
    },
    {
      clientId: 3, vehicleId: 4, status: "WAITING_PARTS", daysAgo: 4,
      items: [
        item(4, "SERVICE", "Troca de kit relação", 1, 120),
        item(5, "PART", "Kit relação CG 160", 1, 149.9, 7),
      ],
    },
    {
      clientId: 4, vehicleId: 5, status: "COMPLETED", daysAgo: 9,
      items: [
        item(6, "SERVICE", "Troca de óleo", 1, 40),
        item(7, "PART", "Óleo Motul 10W40 1L", 2, 54.9, 1),
      ],
    },
    {
      clientId: 5, vehicleId: 6, status: "COMPLETED", daysAgo: 15,
      items: [item(8, "SERVICE", "Regulagem de válvulas", 1, 220)],
      discount: 20,
    },
    {
      clientId: 6, vehicleId: 7, status: "CANCELLED", daysAgo: 20,
      items: [item(9, "SERVICE", "Diagnóstico elétrico", 1, 90)],
      notes: "Cliente desistiu do serviço",
    },
    {
      clientId: 7, vehicleId: 8, status: "OPEN", daysAgo: 0,
      items: [item(10, "SERVICE", "Troca de vela", 1, 35), item(11, "PART", "Vela NGK CR8E", 1, 29.9, 10)],
    },
    {
      clientId: 1, vehicleId: 2, status: "COMPLETED", daysAgo: 30,
      items: [item(12, "PART", "Corrente 428H 118L", 1, 89.9, 8), item(13, "SERVICE", "Instalação de corrente", 1, 70)],
    },
  ];
  const orders: ServiceOrder[] = orderSeed.map((o, i) => {
    const servicesAmount = o.items
      .filter((x) => x.type === "SERVICE")
      .reduce((s, x) => s + (x.totalPrice ?? 0), 0);
    const partsAmount = o.items
      .filter((x) => x.type === "PART")
      .reduce((s, x) => s + (x.totalPrice ?? 0), 0);
    const discountAmount = o.discount ?? 0;
    const vehicle = vehicles[o.vehicleId - 1];
    return {
      id: i + 1,
      clientId: o.clientId,
      clientName: clients[o.clientId - 1].name,
      vehicleId: o.vehicleId,
      vehiclePlate: vehicle.licensePlate,
      vehicleModel: `${vehicle.brand} ${vehicle.model}`,
      userId: 1,
      userName: users[0].name,
      status: o.status,
      entryMileage: vehicle.currentMileage,
      servicesAmount,
      partsAmount,
      discountAmount,
      totalAmount: servicesAmount + partsAmount - discountAmount,
      notes: o.notes,
      createdAt: daysAgo(o.daysAgo),
      completedAt: o.status === "COMPLETED" ? daysAgo(Math.max(o.daysAgo - 1, 0)) : undefined,
      items: o.items,
    };
  });

  const movements: StockMovement[] = [
    { id: 1, productId: 1, productName: products[0].name, type: "IN", quantity: 20, previousQuantity: 12, newQuantity: 32, reason: "Compra de fornecedor", userName: users[0].name, createdAt: daysAgo(10) },
    { id: 2, productId: 1, productName: products[0].name, type: "OUT", quantity: 2, previousQuantity: 34, newQuantity: 32, reason: "Ordem de serviço #4", userName: users[1].name, createdAt: daysAgo(9) },
    { id: 3, productId: 5, productName: products[4].name, type: "ADJUSTMENT", quantity: 3, previousQuantity: 5, newQuantity: 3, reason: "Inventário", userName: users[0].name, createdAt: daysAgo(5) },
  ];

  return { users, categories, clients, vehicles, products, orders, movements };
}
