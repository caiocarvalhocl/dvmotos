import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { AuthService } from "../../core/services/auth.service";
import { ClientService } from "@core/services/client.service";
import { Observable } from "rxjs";
import { VehicleService } from "@core/services/vehicle.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  countClients$: Observable<Number> = this.clientService.getActiveClients();
  countVehicles$: Observable<Number> = this.vehicleService.getActiveVehicles();

  constructor(
    public authService: AuthService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
  ) {}
}
