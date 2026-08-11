import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { UIChart } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { DatePicker } from 'primeng/datepicker';
import { AdminDashboardService } from './admin-dashboard-service';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { OrderService } from '@features/checkout/services/order-service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, Button, UIChart, TableModule, Tag, DatePicker, AdminSidebar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  orderServices = inject(OrderService);
  readonly dashboardService = inject(AdminDashboardService);

  private readonly _router = inject(Router);

  dateRange: Date[] | undefined;
  globalSearch = '';
  orderFilter = signal('');

  readonly filteredOrders = computed(() => {
    const query = this.orderFilter().trim().toLowerCase();
    const orders = this.dashboardService.recentOrders();
    if (!query) {
      return orders;
    }
    return orders.filter(
      (order) =>
        order.shippingCity.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query),
    );
  });

  readonly lineChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#94a3b8',
          callback: (value: string | number) => `$${value}`,
        },
      },
    },
  };

  readonly doughnutChartOptions = {
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          color: '#64748b',
        },
      },
    },
  };

  readonly barChartOptions = {
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#475569' },
      },
    },
  };

  ngOnInit(): void {
    this.dashboardService.loadDashboardData();
  }

  onDateFilterChange(): void {
    if (this.dateRange?.[0] && this.dateRange?.[1]) {
      this.dashboardService.loadDashboardData(this.dateRange[0], this.dateRange[1]);
    }
  }

  onOrderFilterChange(value: string): void {
    this.orderFilter.set(value);
  }

  refreshDashboard(): void {
    this.dashboardService.loadDashboardData(this.dateRange?.[0], this.dateRange?.[1]);
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatTrend(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }
}
