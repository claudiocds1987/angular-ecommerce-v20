import { Product } from './product.model';

/* export interface ProductPaginated {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
 */
// Agregamos <T = Product>
// Esto significa: "Acepta un tipo T, y si no te pasan ninguno, por defecto usa Product"
export interface ProductPaginated<T = any> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
