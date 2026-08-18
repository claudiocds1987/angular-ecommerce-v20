export type GridColumnType = 'text' | 'image' | 'badge' | 'actions';

export interface GridColumn {
  field: string;
  header: string;
  type?: GridColumnType;
  sortable?: boolean;
  truncate?: boolean;
  tooltip?: string; // Tooltip for the header
  width?: string;
  // Specific for badges
  badgeMappings?: Record<
    string | number,
    { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' }
  >;
}

export interface GridAction<T = any> {
  label: string;
  icon?: string;
  action: (row: T) => void;
  visible?: (row: T) => boolean;
}

export interface GridLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: any;
}
