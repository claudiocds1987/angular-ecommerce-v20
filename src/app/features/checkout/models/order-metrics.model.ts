// Métricas generales
export interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

// Evolución de ventas
export interface SalesEvolution {
  date: string; // ISO date string
  revenue: number;
}

// Estados de órdenes
export interface OrderStatus {
  status: string;
  count: number;
}

// Productos más vendidos
export interface TopProduct {
  productName: string;
  quantity: number;
}

// Órdenes recientes
export interface RecentOrder {
  id: number;
  customerName: string;
  destination: string;
  date: string; // ISO date string
  totalAmount: number;
  status: string;
}

// Modelo principal
export interface OrderMetrics {
  metrics: Metrics;
  salesEvolution: SalesEvolution[];
  orderStatuses: OrderStatus[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}
