/* // Este modelo se usa en el filtro izquierdo para el "customer" en el componente products-list
export interface CustomerProductFilter {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryId: string;
  brandId: string;
  sortBy: string;
  order: string;
  minRating?: number | null;
}
 */

// Este modelo se usa en el filtro izquierdo para el "customer" en el componente products-list
export interface CustomerProductFilter {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: number[]; // <-- Múltiples categorías
  brandIds: number[]; // <-- Múltiples marcas
  sortBy: string;
  order: string;
  minRating?: number | null;
}
