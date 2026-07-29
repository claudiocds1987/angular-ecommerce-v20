import { Injectable, signal } from '@angular/core';
import {
  ChartDataSets,
  DashboardMockResponse,
  KpiSummary,
  RecentOrderDto,
} from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  kpiData = signal<KpiSummary | null>(null);
  salesTrendChart = signal<ChartDataSets | null>(null);
  statusDistributionChart = signal<ChartDataSets | null>(null);
  topProductsChart = signal<ChartDataSets | null>(null);
  recentOrders = signal<RecentOrderDto[]>([]);
  pendingOrdersCount = signal<number>(0);
  loading = signal<boolean>(false);

  loadDashboardData(_startDate?: Date, _endDate?: Date): void {
    this.loading.set(true);

    // Mock: simula latencia de red; listo para reemplazar por HttpClient
    setTimeout(() => {
      const data = this._getMockData();
      this.kpiData.set(data.kpis);
      this.salesTrendChart.set(data.salesTrend);
      this.statusDistributionChart.set(data.statusDistribution);
      this.topProductsChart.set(data.topProducts);
      this.recentOrders.set(data.recentOrders);
      this.pendingOrdersCount.set(data.pendingOrdersCount);
      this.loading.set(false);
    }, 250);
  }

  private _getMockData(): DashboardMockResponse {
    return {
      kpis: {
        totalRevenue: 42850,
        totalOrders: 1248,
        averageOrderValue: 34.33,
        totalCustomers: 892,
        revenueChangePercent: 12.5,
        ordersChangePercent: 8.1,
        aovChangePercent: -1.2,
        customersChangePercent: 14.3,
      },
      salesTrend: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [
          {
            label: 'Ingresos',
            data: [9200, 10800, 11500, 12850],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointRadius: 5,
          },
        ],
      },
      statusDistribution: {
        labels: ['Approved', 'Pending', 'Shipped', 'Cancelled'],
        datasets: [
          {
            data: [48, 22, 20, 10],
            backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
            borderWidth: 0,
          },
        ],
      },
      topProducts: {
        labels: ['Audífonos Bluetooth', 'Teclado Mecánico', 'Mouse Gamer', 'Monitor 27"', 'Webcam HD'],
        datasets: [
          {
            label: 'Unidades',
            data: [342, 278, 215, 168, 124],
            backgroundColor: '#93c5fd',
            borderRadius: 6,
          },
        ],
      },
      recentOrders: [
        {
          id: 1054,
          createdAt: new Date('2026-07-29T12:45:00'),
          customerName: 'María González',
          customerEmail: 'maria.g@gmail.com',
          shippingCity: 'Buenos Aires',
          totalAmount: 145.0,
          status: 'Approved',
        },
        {
          id: 1053,
          createdAt: new Date('2026-07-29T11:20:00'),
          customerName: 'Carlos Pérez',
          customerEmail: 'carlos.perez@outlook.com',
          shippingCity: 'Córdoba',
          totalAmount: 89.5,
          status: 'Pending',
        },
        {
          id: 1052,
          createdAt: new Date('2026-07-28T18:05:00'),
          customerName: 'Lucía Fernández',
          customerEmail: 'lucia.f@hotmail.com',
          shippingCity: 'Rosario',
          totalAmount: 312.9,
          status: 'Shipped',
        },
        {
          id: 1051,
          createdAt: new Date('2026-07-28T15:40:00'),
          customerName: 'Diego Martínez',
          customerEmail: 'diego.m@gmail.com',
          shippingCity: 'Mendoza',
          totalAmount: 54.0,
          status: 'Cancelled',
        },
        {
          id: 1050,
          createdAt: new Date('2026-07-28T09:15:00'),
          customerName: 'Ana Rodríguez',
          customerEmail: 'ana.rod@yahoo.com',
          shippingCity: 'La Plata',
          totalAmount: 198.75,
          status: 'Approved',
        },
        {
          id: 1049,
          createdAt: new Date('2026-07-27T21:30:00'),
          customerName: 'Jorge Silva',
          customerEmail: 'jorge.silva@gmail.com',
          shippingCity: 'Mar del Plata',
          totalAmount: 67.2,
          status: 'Shipped',
        },
        {
          id: 1048,
          createdAt: new Date('2026-07-27T14:10:00'),
          customerName: 'Valentina López',
          customerEmail: 'vale.lopez@gmail.com',
          shippingCity: 'Salta',
          totalAmount: 421.0,
          status: 'Pending',
        },
      ],
      pendingOrdersCount: 12,
    };
  }
}
