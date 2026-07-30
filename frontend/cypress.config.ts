import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    defaultCommandTimeout: 8000,
    env: {
      apiUrl: "http://localhost:8080/api",
      adminEmail: "test@test.com",
      adminPassword: "test123",
    },
  },
});
