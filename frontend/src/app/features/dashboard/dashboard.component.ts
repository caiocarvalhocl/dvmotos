import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
