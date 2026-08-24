import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminDashboardService } from '../admin-dashboard/admin-dashboard-service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, TooltipModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebar {
  isSidebarCollapsed = signal(false);
  activeRoute = signal<string>('');
  readonly dashboardService = inject(AdminDashboardService);
  private readonly _router = inject(Router);

  // La función isActive detecta si estás en la ruta que se le indicó,
  // y si es así aplica la clase azul al botón para que el usuario sepa
  // en qué sección del sistema se encuentra.
  // Se llama en el <button>, por ejemplo:
  // [class.bg-blue-600]="isActive('/admin/product-extra-attribute-definition')"

  /* isActive(path: string): boolean {
    return this._router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  } */

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }
}
