export interface CartItemDto {
  productId: number;
  quantity: number;
}

export interface CartDto {
  userId: number | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZipCode: string;
  items: CartItemDto[];
}
