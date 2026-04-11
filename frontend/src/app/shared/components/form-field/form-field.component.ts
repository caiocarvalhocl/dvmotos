import { CommonModule } from "@angular/common";
import { Component, HostBinding, Input } from "@angular/core";

@Component({
  selector: "app-form-field",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./form-field.component.html",
  styleUrls: ["./form-field.component.scss"],
})
export class FormFieldComponent {
  @Input() label!: string;
  @Input() inputId!: string;
  @Input() icon?: string;
  @Input() required = false;
  @Input() colClass = "md:col-6";

  @HostBinding("class") get hostClass() {
    return `field col-12 ${this.colClass}`;
  }
}
