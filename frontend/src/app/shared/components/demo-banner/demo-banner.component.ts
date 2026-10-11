import { Component } from "@angular/core";
import { environment } from "@env/environment";

@Component({
  selector: "app-demo-banner",
  standalone: true,
  template: `
    @if (isDemo) {
      <div class="demo-banner" role="status">
        <i class="pi pi-info-circle" aria-hidden="true"></i>
        <span>
          <strong>Modo demonstração:</strong> os dados são fictícios e voltam ao
          estado inicial ao recarregar a página.
        </span>
      </div>
    }
  `,
  styles: [
    `
      .demo-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #fff4d6;
        color: #5c4400;
        border-bottom: 1px solid #f0d58a;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class DemoBannerComponent {
  readonly isDemo = environment.demo;
}
