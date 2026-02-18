export interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  discountPercentage?: number;
  finalPrice?: number;
  rating?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
