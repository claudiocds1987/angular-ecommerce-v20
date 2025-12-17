export interface Product {
  id: number;
  title: string;
  price: number;
  rating: { rate: number; count: number }; // "count" seria Stock disponible
  image: string;
  category?: string;
}