import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { authInterceptor } from "./app/core/interceptors/auth.interceptor";
import { ConfirmationService, MessageService } from "primeng/api";
import { environment } from "@env/environment";
import { demoBackendInterceptor } from "./app/core/demo/demo-backend.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
        authInterceptor,
        // Must stay last: it answers requests instead of forwarding them.
        ...(environment.demo ? [demoBackendInterceptor] : []),
      ])),
    provideAnimations(),
    MessageService,
    ConfirmationService,
  ],
}).catch((err) => console.error(err));
