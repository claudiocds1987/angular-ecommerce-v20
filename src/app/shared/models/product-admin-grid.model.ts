export interface ProductAdminGrid {
  id: string | number;
  title: string;
  price: number;
  sku: string;
  stock: number;
  thumbnail: string;
  categoryId: number | string;
  categoryName: string;
  brandId: number | string;
  brandName: string;
  discountPercentage: number;
  finalPrice: number;
}
