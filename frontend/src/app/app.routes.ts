import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { adminGuard } from "@core/guards/admin.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "",
    loadComponent: () =>
      import("./layout/main-layout/main-layout.component").then(
        (m) => m.MainLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: "clients",
        loadComponent: () =>
          import("./features/clients/client-list/client-list.component").then(
            (m) => m.ClientListComponent,
          ),
      },
      {
        path: "clients/new",
        loadComponent: () =>
          import("./features/clients/client-form/client-form.component").then(
            (m) => m.ClientFormComponent,
          ),
      },
      {
        path: "clients/:id",
        loadComponent: () =>
          import("./features/clients/client-form/client-form.component").then(
            (m) => m.ClientFormComponent,
          ),
      },
      {
        path: "vehicles",
        loadComponent: () =>
          import("./features/vehicles/vehicle-list/vehicle-list.component").then(
            (m) => m.VehicleListComponent,
          ),
      },
      {
        path: "vehicles/new",
        loadComponent: () =>
          import("./features/vehicles/vehicle-form/vehicle-form.component").then(
            (m) => m.VehicleFormComponent,
          ),
      },
      {
        path: "vehicles/:id",
        loadComponent: () =>
          import("./features/vehicles/vehicle-form/vehicle-form.component").then(
            (m) => m.VehicleFormComponent,
          ),
      },
      // Users routes protected by adminGuard
      {
        path: "users",
        canActivate: [adminGuard],
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/users/user-list/user-list.component").then(
                (m) => m.UserListComponent,
              ),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./features/users/user-form/user-form.component").then(
                (m) => m.UserFormComponent,
              ),
          },
          {
            path: ":id",
            loadComponent: () =>
              import("./features/users/user-form/user-form.component").then(
                (m) => m.UserFormComponent,
              ),
          },
        ],
      },
      {
        path: "myprofile",
        loadComponent: () =>
          import("./features/profile/my-profile/my-profile.component").then(
            (m) => m.MyProfileComponent,
          ),
      },
      // Categories
      {
        path: "categories",
        loadComponent: () =>
          import("./features/categories/category-list/category-list.component").then(
            (m) => m.CategoryListComponent,
          ),
      },
      {
        path: "categories/new",
        loadComponent: () =>
          import("./features/categories/category-form/category-form.component").then(
            (m) => m.CategoryFormComponent,
          ),
      },
      {
        path: "categories/:id",
        loadComponent: () =>
          import("./features/categories/category-form/category-form.component").then(
            (m) => m.CategoryFormComponent,
          ),
      },
      // Products
      {
        path: "products",
        loadComponent: () =>
          import("./features/products/product-list/product-list.component").then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: "products/new",
        loadComponent: () =>
          import("./features/products/product-form/product-form.component").then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: "products/:id",
        loadComponent: () =>
          import("./features/products/product-form/product-form.component").then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: "products/:id/stock",
        loadComponent: () =>
          import("./features/products/stock-movement/stock-movement.component").then(
            (m) => m.StockMovementComponent,
          ),
      },
    ],
  },
  { path: "**", redirectTo: "/dashboard" },
];
