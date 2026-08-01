import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDashboardService } from '../admin-dashboard/admin-dashboard-service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebar {
  sidebarCollapsed = signal(false);
  readonly dashboardService = inject(AdminDashboardService);
  private readonly _router = inject(Router);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  goToProducts(): void {
    this._router.navigate(['admin/products-grid-admin']);
  }

  goToExtraAttributes(): void {
    this._router.navigate(['admin/product-extra-attribute-definition']);
  }
}
