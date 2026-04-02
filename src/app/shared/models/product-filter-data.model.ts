export interface ProductFilterData {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryId: string;
  brandId: string;
  sortBy: string;
  order: string;
}
