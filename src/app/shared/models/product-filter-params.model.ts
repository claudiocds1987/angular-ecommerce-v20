export interface ProductFilterParams {
  id?: number;
  title?: string;
  price?: number;
  sku?: string;
  discountPercentage?: number;
  finalPrice?: number;
  categoryId?: number;
  brandId?: number;
  stock?: number;
  isActive?: boolean | number;
  page?: number;
  limit?: number;
  sortColumn?: string; // para hacer sort por columuna (ej: 'name', 'id')
  sortOrder?: 'asc' | 'desc' | ''; // ordenamiento de sort('asc', 'desc', o vacio para no sort)
}
