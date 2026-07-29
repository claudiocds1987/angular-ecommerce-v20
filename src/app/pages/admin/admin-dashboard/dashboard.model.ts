export interface KpiSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueChangePercent: number;
  ordersChangePercent: number;
  aovChangePercent: number;
  customersChangePercent: number;
}

export interface ChartDataSets {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointRadius?: number;
    borderRadius?: number;
  }>;
}

export interface RecentOrderDto {
  id: number;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  totalAmount: number;
  status: string;
}

export interface DashboardMockResponse {
  kpis: KpiSummary;
  salesTrend: ChartDataSets;
  statusDistribution: ChartDataSets;
  topProducts: ChartDataSets;
  recentOrders: RecentOrderDto[];
  pendingOrdersCount: number;
}
