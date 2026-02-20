import { Product } from './product.model';

// Define esto en tu archivo de modelos o arriba de tu servicio
export interface GeminiResponse {
  Response: string;
  Products: Product[];
}
