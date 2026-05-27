// Define esto en tu archivo de modelos o arriba de tu servicio
/* export interface GeminiResponse {
  Response: string;
  Products: Product[];
} */

import { Product } from '@features/products/models/product.model';

export interface GeminiResponse {
  response: string;
  products: Product[];
}
