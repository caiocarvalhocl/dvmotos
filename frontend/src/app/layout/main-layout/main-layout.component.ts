import { Component, HostListener, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { MenuModule, Menu } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";
import { MenuItem } from "primeng/api";
import { AuthService } from "../../core/services/auth.service";
import { TagModule } from "primeng/tag";
import { DemoBannerComponent } from "../../shared/components/demo-banner/demo-banner.component";
import { AdSlotComponent } from "../../shared/components/ad-slot/ad-slot.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    TagModule,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    DemoBannerComponent,
    AdSlotComponent,
  ],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  @ViewChild("menu") sidebarMenu!: Menu;

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

  // Desktop: sidebar recolhida (apenas ícones). Mobile: drawer aberto/fechado.
  collapsed = false;
  mobileOpen = false;
  isMobile = false;

  constructor(
    public authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateViewport();
  }

  @HostListener("window:resize")
  updateViewport(): void {
    this.isMobile = window.innerWidth <= 992;
    if (!this.isMobile) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.collapsed = !this.collapsed;
    }
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  toggleSidebarMenu(event: Event): void {
    if (this.collapsed && !this.isMobile) {
      this.collapsed = false;
      this.changeDetectorRef.detectChanges();
    }
    this.sidebarMenu.toggle(event);
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
}
