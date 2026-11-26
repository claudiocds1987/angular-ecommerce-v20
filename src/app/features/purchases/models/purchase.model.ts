// Representa cada producto comprado en la vista "Mis Compras" (mapeado desde MyPurchaseItemDto).
export interface MyPurchaseItem {
  orderId: number;
  productId: number;
  productTitle: string;
  productImage: string;
  categoryId?: number | null;
  categoryName?: string | null;
  createdAt: string; // ASP.NET Core serializa DateTime como string ISO-8601
  price: number;
  quantity: number;
}

// Filtros soportados por el endpoint GET /api/orders/my-purchases.
export interface MyPurchasesFilters {
  dateFrom?: Date | string | null;
  dateTo?: Date | string | null;
  categoryId?: number | null;
  search?: string | null;
}
