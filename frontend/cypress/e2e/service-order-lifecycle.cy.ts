/// <reference types="cypress" />

// Full lifecycle of a Service Order (Ordem de Serviço), covering the app's core
// workflow end-to-end against a real running backend + isolated test database.
// See frontend/cypress/README.md for how to stand up that environment.
describe("Service Order lifecycle", () => {
  const apiUrl = Cypress.env("apiUrl");
  const adminEmail = Cypress.env("adminEmail");
  const adminPassword = Cypress.env("adminPassword");

  // Unique per run so the suite is repeatable against a warm test DB without
  // colliding on the client's unique email or the vehicle's unique plate.
  const runId = Date.now();
  const clientName = `Cypress QA Cliente ${runId}`;
  const plateSeq = String(runId % 1000).padStart(3, "0");
  const licensePlate = `CYP${plateSeq[0]}Q${plateSeq[1]}${plateSeq[2]}`; // Mercosul format: LLL-D-L-DD

  let token: string;

  before(() => {
    cy.request("POST", `${apiUrl}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    })
      .its("body.token")
      .then((t: string) => {
        token = t;
        return cy.request({
          method: "POST",
          url: `${apiUrl}/clients`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            name: clientName,
            email: `cypress.${runId}@example.com`,
            phone: "(11) 99999-0000",
          },
        });
      })
      .then((res) => {
        const clientId = res.body.id;
        Cypress.env("seedClientId", clientId);
        return cy.request({
          method: "POST",
          url: `${apiUrl}/vehicles`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            clientId,
            licensePlate,
            brand: "Honda",
            model: "CG 160",
          },
        });
      })
      .then((res) => {
        Cypress.env("seedVehicleId", res.body.id);
      });
  });

  beforeEach(() => {
    cy.loginUI(adminEmail, adminPassword);
  });

  function openNewServiceOrderForm() {
    cy.visit("/service-orders/new");
    cy.get("#client").should("exist");
  }

  function selectSeededClientAndVehicle() {
    cy.selectAutocomplete("client", String(runId), clientName);

    // Deliberate, standalone assertion: this is the area where a "vehicle not
    // found" bug was previously reported/investigated (vehicle dropdown not
    // populating after selecting a client). Do not skip or fold this into the
    // subsequent selection step.
    cy.get('p-dropdown[name="vehicleId"]').click();
    cy.get(".p-dropdown-panel li.p-dropdown-item", { timeout: 10000 }).should(
      "contain.text",
      licensePlate,
    );
    cy.get(".p-dropdown-panel li.p-dropdown-item").contains(licensePlate).click();
  }

  function addItem(options: {
    type?: "SERVICE" | "PART";
    description: string;
    quantity: number;
    unitPrice: number;
  }) {
    cy.contains("button", "Adicionar Item").click();
    cy.get(".p-dialog").should("be.visible");

    if (options.type === "PART") {
      cy.selectDropdownByName("itemType", "Peça");
    }

    cy.get("#itemDescription").clear().type(options.description);
    cy.get("#itemQty input").clear().type(String(options.quantity));
    cy.get("#itemPrice input")
      .clear()
      .type(String(options.unitPrice).replace(".", ","));
    cy.contains(".p-dialog-footer button", "Adicionar").click();
    cy.get(".p-dialog").should("not.exist");
  }

  it("creates an OS, adds service and part items, verifies the total, and completes the status flow", () => {
    openNewServiceOrderForm();
    selectSeededClientAndVehicle();

    addItem({ type: "SERVICE", description: "Troca de óleo e filtro", quantity: 2, unitPrice: 100 });
    addItem({ type: "PART", description: "Filtro de óleo", quantity: 1, unitPrice: 50 });

    cy.get("#discount input").clear().type("20,00");

    // Total = (2 * 100) + (1 * 50) - 20 = 230 (quantidade * preço unitário - desconto)
    cy.contains("td", "Total:")
      .closest("tr")
      .find("td")
      .last()
      .invoke("text")
      .should("match", /230[.,]00/);

    cy.contains("button", "Abrir OS").click();
    cy.location("pathname", { timeout: 10000 }).should("match", /\/service-orders\/\d+$/);
    cy.contains("p-tag", "Aberta").should("exist");

    // Status flow: aberta -> em andamento -> concluída
    cy.contains("button", "Iniciar").click();
    cy.confirmDialogAccept();
    cy.contains("p-tag", "Em Andamento").should("exist");

    cy.contains("button", "Concluir").click();
    cy.confirmDialogAccept();
    cy.contains("p-tag", "Concluída").should("exist");

    // Completed orders are terminal: no further status actions should render.
    cy.get(".status-actions").should("not.exist");

    cy.visit("/service-orders");
    cy.location("pathname").should("eq", "/service-orders");
  });

  it("cancels an open OS via the confirmation dialog", () => {
    openNewServiceOrderForm();
    selectSeededClientAndVehicle();
    addItem({ type: "SERVICE", description: "Serviço avulso", quantity: 1, unitPrice: 80 });

    cy.contains("button", "Abrir OS").click();
    cy.location("pathname", { timeout: 10000 }).should("match", /\/service-orders\/\d+$/);
    cy.contains("p-tag", "Aberta").should("exist");

    cy.contains("button", "Cancelar OS").click();
    cy.get(".p-confirm-dialog").should("be.visible").and("contain.text", "cancelar");
    cy.confirmDialogAccept();
    cy.contains("p-tag", "Cancelada").should("exist");
    cy.get(".status-actions").should("not.exist");
  });
});
