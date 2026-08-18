import { Component, input, output, computed, ViewChild, ElementRef } from '@angular/core';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';

import { GridColumn, GridAction, GridLazyLoadEvent } from './grid-prime.model';

@Component({
  selector: 'app-grid-prime',
  standalone: true,
  imports: [TableModule, SkeletonModule, MenuModule, TooltipModule, ButtonModule, TagModule],
  templateUrl: './grid-prime.component.html',
  styleUrl: './grid-prime.component.scss',
})
export class GridPrimeComponent {
  // Inputs via signals
  data = input.required<any[]>();
  columns = input.required<GridColumn[]>();

  mode = input<'client' | 'server'>('client');
  paginationType = input<'paginator' | 'infinite-scroll'>('paginator');

  loading = input<boolean>(false);
  totalRecords = input<number>(0);

  rowsPerPage = input<number>(10);
  rowsPerPageOptions = input<number[]>([10, 20, 50]);

  actions = input<GridAction[]>([]);
  emptyMessage = input<string>('No se encontraron resultados');

  showExport = input<boolean>(false);

  // Outputs
  lazyLoad = output<GridLazyLoadEvent>();
  action = output<{ action: GridAction; row: any }>();
  export = output<void>();
  rowDblClick = output<any>();

  // Computed properties
  isServerMode = computed(() => this.mode() === 'server');
  isVirtualScroll = computed(() => this.paginationType() === 'infinite-scroll');

  // Internal state for menus
  selectedRow: any;

  getMenuItems(row: any): MenuItem[] {
    return this.actions()
      .filter((action) => !action.visible || action.visible(row))
      .map((action) => ({
        label: action.label,
        icon: action.icon,
        command: () => {
          this.action.emit({ action, row });
          action.action(row);
        },
      }));
  }

  handleLazyLoad(event: TableLazyLoadEvent) {
    if (this.isServerMode()) {
      this.lazyLoad.emit({
        first: event.first || 0,
        rows: event.rows || this.rowsPerPage(),
        sortField: event.sortField as string,
        sortOrder: event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : undefined,
        filters: event.filters,
      });
    }
  }

  handleExport() {
    this.export.emit();
  }

  handleRowDblClick(rowData: any) {
    this.rowDblClick.emit(rowData);
  }

  getCellText(row: Record<string, unknown>, field: string): string {
    const value = row[field];
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  // grid-prime.component.ts
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = 'assets/placeholder.png';

    // Si la imagen que falló YA es el placeholder, no reintentamos:
    // evita el loop infinito si el placeholder también está roto.
    if (img.src.endsWith(fallback)) {
      img.onerror = null; // corta cualquier futuro evento error en este <img>
      return;
    }

    img.src = fallback;
  }
}
