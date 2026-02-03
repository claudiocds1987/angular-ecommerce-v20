export interface ProductFilterData {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  category: string;
  sortBy: string;
  order: string;
}
