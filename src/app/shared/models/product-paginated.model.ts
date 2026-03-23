import { Product } from './product.model';

export interface ProductPaginated {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
