import { Component, Input } from "@angular/core";

/**
 * Reserved space for ads or sponsored content. Monetization is not
 * implemented; the slot only shows where a banner would be rendered.
 */
@Component({
  selector: "app-ad-slot",
  standalone: true,
  template: `
    <aside class="ad-slot" [attr.aria-label]="'Espaço publicitário ' + format">
      <small>Publicidade</small>
      <span>Espaço para anúncio ({{ format }})</span>
    </aside>
  `,
  styles: [
    `
      .ad-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        min-height: 90px;
        margin: 1.5rem 0;
        border: 1px dashed var(--surface-400, #c0c4cc);
        border-radius: 8px;
        color: var(--text-color-secondary, #6b7280);
        background: var(--surface-50, #f9fafb);
      }
      small {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.65rem;
      }
    `,
  ],
})
export class AdSlotComponent {
  @Input() format = "728x90";
}
