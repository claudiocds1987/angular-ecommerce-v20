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
import { OrderMetrics, RecentOrder } from '@features/checkout/models/order-metrics.model';
import { ChartData } from '@shared/models/chart-data.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, Button, UIChart, TableModule, Tag, DatePicker, AdminSidebar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  readonly orderService = inject(OrderService);
  readonly dashboardService = inject(AdminDashboardService); // Reemplazar por OrderService endpoint metrics

  private readonly _router = inject(Router);
  readonly orderMetricsSig = signal<OrderMetrics | null>(null);

  dateRange: Date[] | undefined;
  globalSearch = '';
  orderFilter = signal('');
  barChartData: ChartData | null = null;
  doughnutChartData: ChartData | null = null;
  lineChartData: ChartData | null = null;

  readonly filteredOrders = computed(() => {
    const query = this.orderFilter().trim().toLowerCase();
    const orders = this.orderMetricsSig()?.recentOrders || [];
    if (!query) {
      return orders;
    }
    return orders.filter(
      (order: RecentOrder) =>
        order.destination.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query), //||
      //order.customerEmail.toLowerCase().includes(query),
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
    this._getOrderMetrics();
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

  // cambiar nombre genrico loadDashboardData
  private _getOrderMetrics(): void {
    this.orderService.getOrderMetrics().subscribe({
      next: (metrics: OrderMetrics) => {
        this.orderMetricsSig.set(metrics);

        // Gráfico de barras de top productos
        this.barChartData = {
          labels: metrics.topProducts.map((p) => p.productName),
          datasets: [
            {
              label: 'Cantidad vendida',
              data: metrics.topProducts.map((p) => p.quantity),
              backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043'],
            },
          ],
        };

        // Gráfico doughnut de estados
        this.doughnutChartData = {
          labels: metrics.orderStatuses.map((s) => s.status),
          datasets: [
            {
              data: metrics.orderStatuses.map((s) => s.count),
              backgroundColor: ['#42A5F5', '#FF6384', '#FFCE56', '#66BB6A'],
            },
          ],
        };

        // Gráfico de línea de evolución de ventas
        this.lineChartData = {
          labels: metrics.salesEvolution.map((s) => s.date),
          datasets: [
            {
              label: 'Ingresos',
              data: metrics.salesEvolution.map((s) => s.revenue),
              fill: false,
              borderColor: '#42A5F5',
              tension: 0.1, // suaviza la curva
            },
          ],
        };
      },
      error: (error) => {
        console.error('Error fetching order metrics:', error);
      },
    });
  }
}
