/* import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridPrimeComponent } from '../../../shared/components/grid-prime/grid-prime.component';
import {
  GridColumn,
  GridAction,
  GridLazyLoadEvent,
} from '../../../shared/components/grid-prime/grid-prime.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Simulating a backend response interface
interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, GridPrimeComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  private messageService = inject(MessageService);

  // State Signals
  usersData = signal<any[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  // Grid Configuration
  columns = signal<GridColumn[]>([
    { field: 'avatar', header: 'Avatar', type: 'image', width: '80px' },
    { field: 'name', header: 'Nombre', sortable: true },
    {
      field: 'email',
      header: 'Correo Electrónico',
      sortable: true,
      truncate: true,
      width: '250px',
    },
    {
      field: 'status',
      header: 'Estado',
      type: 'badge',
      badgeMappings: {
        Active: { label: 'Activo', severity: 'success' },
        Pending: { label: 'Pendiente', severity: 'warn' },
        Banned: { label: 'Baneado', severity: 'danger' },
      },
    },
  ]);

  actions = signal<GridAction[]>([
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      action: (row) => this.editUser(row),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      action: (row) => this.deleteUser(row),
    },
  ]);

  ngOnInit() {
    // initial load happens automatically if mode='server' triggers onLazyLoad
    // or we can manually trigger the first load.
  }

  // Event Handlers
  onLazyLoad(event: GridLazyLoadEvent) {
    this.loading.set(true);

    // Simulate HTTP call to ASP.NET Core API
    setTimeout(() => {
      const mockData = this.generateMockData(event.first, event.rows);
      this.usersData.set(mockData.data);
      this.totalRecords.set(mockData.totalRecords);
      this.loading.set(false);
    }, 1500); // Simulated network delay
  }

  onAction(event: { action: GridAction; row: any }) {
    console.log('Action triggered:', event.action.label, event.row);
  }

  onExport() {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Iniciando descarga a Excel...',
    });
    // Llamar al servicio ASP.NET Core para obtener el archivo Excel
  }

  // Business Logic Methods
  private editUser(row: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Editar',
      detail: `Editando usuario: ${row.name}`,
    });
  }

  private deleteUser(row: any) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Eliminar',
      detail: `Usuario ${row.name} eliminado`,
    });
  }

  // Mock Data Generator
  private generateMockData(first: number, rows: number): PaginatedResponse<any> {
    const allUsers = Array.from({ length: 100 }).map((_, i) => ({
      id: i + 1,
      name: `Usuario ${i + 1}`,
      email: `usuario${i + 1}@ejemplo.com.arconuncorreomuylargoparavereltruncado`,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Banned',
    }));

    return {
      data: allUsers.slice(first, first + rows),
      totalRecords: 100,
    };
  }
}
 */
