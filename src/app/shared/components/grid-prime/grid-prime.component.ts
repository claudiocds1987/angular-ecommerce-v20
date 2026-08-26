import { Component, input, output, computed, ViewChild, ElementRef } from '@angular/core';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';

import { GridColumn, GridQueryParams, GridElipsis, GridExtraAction } from './grid-prime.model';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-grid-prime',
  standalone: true,
  imports: [
    TableModule,
    SkeletonModule,
    MenuModule,
    TooltipModule,
    ButtonModule,
    TagModule,
    Button,
  ],
  templateUrl: './grid-prime.component.html',
  styleUrl: './grid-prime.component.scss',
})
// Usamos <TData, TAction> porque el tipo concreto se define en el componente padre:
// - TData: el tipo de los datos que se renderizan en la grilla (ej. GridData).
// - TAction: el tipo de los datos originales que se usan en las acciones (ej. ProductAdminGrid).
// De esta forma, el GridPrimeComponent no está atado a un modelo fijo,
// sino que el padre le pasa los tipos correctos según el contexto.
// Ejemplo: en ProductsGridAdmin, mappedProductsSig() devuelve GridData[],
// mientras que elipsisActions() está tipado con ProductAdminGrid[].
// Gracias a esta separación, el componente puede mostrar datos transformados
// y ejecutar acciones sobre el modelo real que loe envia el padre en los input (tipado fuerte).
// Con <TData, TAction> el compilador infiere los tipos desde el padre,
// manteniendo autocompletado y chequeo de tipos. Si usáramos 'any',
// perderíamos validación en tiempo de compilación y seguridad en las acciones,
// ya que el componente no sabría qué propiedades existen en el modelo.
export class GridPrimeComponent<TData, TAction> {
  // Inputs via signals
  data = input.required<TData[]>();
  columns = input.required<GridColumn[]>();

  mode = input<'client' | 'server'>('client');
  paginationType = input<'paginator' | 'infinite-scroll'>('paginator');

  loading = input<boolean>(false);
  totalRecords = input<number>(0);

  rowsPerPage = input<number>(10);
  rowsPerPageOptions = input<number[]>([10, 20, 50]);

  elipsisActions = input<GridElipsis<TAction>[]>([]);
  extraActions = input<GridExtraAction[]>([]);
  emptyMessage = input<string>('No se encontraron resultados');

  //showExport = input<boolean>(false);

  // Outputs
  queryParamsChange = output<GridQueryParams>();
  action = output<{ action: GridElipsis<TAction>; row: TAction }>();
  export = output<void>();
  rowDblClick = output<TData>();
  activeMenuModel: MenuItem[] = [];

  // Computed properties
  isServerMode = computed(() => this.mode() === 'server');
  isVirtualScroll = computed(() => this.paginationType() === 'infinite-scroll');

  onMenuClick(event: MouseEvent, rowData: TAction, menu: any) {
    event.stopPropagation();

    this.activeMenuModel = this.elipsisActions()
      .filter((action) => !action.visible || action.visible(rowData))
      .map((action) => ({
        label: action.label,
        icon: action.icon,
        command: () => {
          this.action.emit({ action, row: rowData });
          action.action(rowData);
        },
      }));

    menu.toggle(event);
  }

  // Procesa el evento de carga perezosa (lazy load) proveniente de PrimeNG
  // y emite los parámetros normalizados de consulta para el servidor.
  // @param event - Evento nativo de PrimeNG que contiene la información de
  // paginación (first, rows), ordenamiento (sortField, sortOrder) y filtros aplicados.

  onGridQueryParams(event: TableLazyLoadEvent) {
    if (this.isServerMode()) {
      this.queryParamsChange.emit({
        first: event.first || 0,
        rows: event.rows || this.rowsPerPage(),
        sortField: event.sortField as string,
        sortOrder: event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : undefined,
        filters: event.filters,
      });
    }
  }

  handleRowDblClick(rowData: TData) {
    this.rowDblClick.emit(rowData);
  }

  getCellText(row: Record<string, unknown>, field: string): string {
    const value = row[field];
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = 'assets/placeholder.png';
    if (img.src.endsWith(fallback)) {
      img.onerror = null;
      return;
    }
    img.src = fallback;
  }
}
