import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { MessageModule } from "primeng/message";
import { AuthService, LoginRequest } from "../../../core/services/auth.service";
import { environment } from "@env/environment";
import { DEMO_CREDENTIALS } from "../../../core/demo/demo-data";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: "",
    password: "",
  };

  loading = signal(false);
  error = signal<string | null>(null);
  year = new Date().getFullYear();
  readonly isDemo = environment.demo;
  readonly demoCredentials = DEMO_CREDENTIALS;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  useDemoCredentials(): void {
    this.credentials = { ...DEMO_CREDENTIALS };
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || "E-mail ou senha incorretos");
      },
    });
  }
}
