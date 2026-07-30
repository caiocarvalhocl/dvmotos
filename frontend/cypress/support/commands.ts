/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Logs in through the real UI (email/password on /login) and waits for the dashboard redirect. */
      loginUI(email: string, password: string): Chainable<void>;
      /** Types into a p-autoComplete host (by its `id`) and clicks the suggestion whose text matches. */
      selectAutocomplete(hostId: string, query: string, optionText: string): Chainable<void>;
      /** Opens a p-dropdown host (by its `name` attribute, since PrimeNG duplicates `id` onto an inner div) and clicks the option whose text matches. */
      selectDropdownByName(name: string, optionText: string): Chainable<void>;
      /** Clicks "Sim"/"Sim, remover" on the currently open PrimeNG confirm dialog. */
      confirmDialogAccept(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginUI", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("#email").clear().type(email);
  cy.get("#password input").clear().type(password);
  cy.get("button.btn-login").click();
  cy.location("pathname", { timeout: 10000 }).should("eq", "/dashboard");
});

Cypress.Commands.add("selectAutocomplete", (hostId: string, query: string, optionText: string) => {
  cy.get(`#${hostId} input`).click().clear().type(query);
  cy.get(".p-autocomplete-panel li.p-autocomplete-item", { timeout: 10000 })
    .contains(optionText)
    .click();
});

Cypress.Commands.add("selectDropdownByName", (name: string, optionText: string) => {
  cy.get(`p-dropdown[name="${name}"]`).click();
  cy.get(".p-dropdown-panel li.p-dropdown-item", { timeout: 10000 })
    .contains(optionText)
    .click();
});

Cypress.Commands.add("confirmDialogAccept", () => {
  cy.get(".p-confirm-dialog-accept", { timeout: 10000 }).click();
});

export {};
