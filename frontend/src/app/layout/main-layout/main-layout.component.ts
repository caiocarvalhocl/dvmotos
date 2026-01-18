import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
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
    {
      label: "Usuários",
      icon: "pi pi-user-edit",
      routerLink: "/users",
      visible: this.authService.isAdmin(),
    },
  ];

  userMenuItems: MenuItem[] = [
    { label: "Meu Perfil", icon: "pi pi-user", routerLink: "/my-profile" },
    { separator: true },
    {
      label: "Sair",
      icon: "pi pi-sign-out",
      command: () => this.authService.logout(),
    },
  ];

  constructor(public authService: AuthService) {}
}
