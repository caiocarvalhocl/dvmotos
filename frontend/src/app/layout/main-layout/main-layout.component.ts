import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { AuthService } from "../../core/services/auth.service";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    TagModule,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent {
  menuItems: MenuItem[] = [
    { label: "Dashboard", icon: "pi pi-home", routerLink: "/dashboard" },
    { label: "Clientes", icon: "pi pi-users", routerLink: "/clients" },
    { label: "Veículos", icon: "pi pi-car", routerLink: "/vehicles" },
    { label: "Categorias", icon: "pi pi-tags", routerLink: "/categories" },
    { label: "Produtos", icon: "pi pi-box", routerLink: "/products" },
    {
      label: "Ordens de Serviço",
      icon: "pi pi-file-edit",
      routerLink: "/service-orders",
    },
    {
      label: "Usuários",
      icon: "pi pi-user-edit",
      routerLink: "/users",
      visible: this.authService.isAdmin(),
    },
  ];

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  userMenuItems: MenuItem[] = [
    { label: "Meu Perfil", icon: "pi pi-user", routerLink: "/myprofile" },
    { separator: true },
    {
      label: "Sair",
      icon: "pi pi-sign-out",
      command: () => this.authService.logout(),
    },
  ];

  constructor(public authService: AuthService) {}
}
