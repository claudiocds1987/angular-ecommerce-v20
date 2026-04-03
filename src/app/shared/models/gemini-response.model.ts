import { Product } from './product.model';

// Define esto en tu archivo de modelos o arriba de tu servicio
/* export interface GeminiResponse {
  Response: string;
  Products: Product[];
} */

export interface GeminiResponse {
  response: string;
  products: Product[];
}
