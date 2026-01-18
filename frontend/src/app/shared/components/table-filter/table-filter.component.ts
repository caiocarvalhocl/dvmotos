import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
} from "rxjs";

export interface FilterState {
  search: string;
  active: boolean | null;
}

@Component({
  selector: "app-table-filter",
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, DropdownModule],
  templateUrl: "./table-filter.component.html",
  styleUrls: ["./table-filter.component.scss"],
})
export class TableFilterComponent implements OnDestroy {
  @Input() placeholder = "Pesquisar...";
  @Input() showStatus = true;

  @Output() filterChange = new EventEmitter<FilterState>();

  searchTerm = "";
  selectedStatus: boolean | null = null; // Começa como 'Todos' (null)

  statusOptions = [
    { label: "Todos os Status", value: null },
    { label: "Ativos", value: true },
    { label: "Inativos", value: false },
  ];

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor() {
    // Configura o debounce aqui para não repetir nas páginas
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.emitFilter();
      });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  // Método unificado que emite o estado atual
  emitFilter(): void {
    this.filterChange.emit({
      search: this.searchTerm,
      active: this.selectedStatus,
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
