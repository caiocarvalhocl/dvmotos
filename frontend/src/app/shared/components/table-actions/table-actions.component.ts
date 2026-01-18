import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-table-actions",
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  templateUrl: "./table-actions.component.html",
  styleUrls: ["./table-actions.component.scss"],
})
export class TableActionsComponent {
  // Rota para edição (ex: '/clients'). Se não passar, esconde o botão de editar.
  @Input() editRoute: string = "";

  // ID do objeto para concatenar na rota (ex: 123 -> '/clients/123')
  @Input() id: number | string | undefined;

  // Estado do item.
  // true = Item Ativo (Mostra botão de bloquear/desativar)
  // false = Item Inativo (Mostra botão de ativar)
  // undefined/null = Modo Exclusão simples (Mostra lixeira)
  @Input() isActive: boolean | undefined;

  // Texto dos tooltips (opcionais, já tem padrão)
  @Input() editTooltip: string = "Editar";

  // Evento emitido ao clicar no botão de ação (Toggle ou Delete)
  @Output() onAction = new EventEmitter<void>();

  // Lógica para definir o ícone do botão de ação
  get actionIcon(): string {
    if (this.isActive === undefined || this.isActive === null)
      return "pi pi-trash";
    return this.isActive ? "pi pi-ban" : "pi pi-check-circle";
  }

  // Lógica para definir a classe de cor do botão
  get actionClass(): string {
    const base = "p-button-text p-button-sm action-btn";
    if (this.isActive === undefined || this.isActive === null)
      return `${base} btn-danger`; // Lixeira (Vermelho)
    return this.isActive ? `${base} btn-danger` : `${base} btn-success`; // Ban (Vermelho) ou Check (Verde)
  }

  // Lógica para o texto do Tooltip
  get actionTooltip(): string {
    if (this.isActive === undefined || this.isActive === null) return "Excluir";
    return this.isActive ? "Desativar" : "Ativar";
  }

  emitAction(): void {
    console.log(this.editRoute, this.id, this.isActive);
    this.onAction.emit();
  }
}
