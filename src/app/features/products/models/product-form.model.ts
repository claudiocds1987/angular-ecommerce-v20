export interface ExtraAttributeFormItem {
  id: number;
  name: string;
  label: string;
  dataType: string;
  value: string | boolean;
}

export interface ImageFormItem {
  id?: number | string;
  imageUrl: string;
}

export interface ProductFormModel {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  sku: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  availabilityStatus: string;
  minimumOrderQuantity: number;
  thumbnail: string;
  categoryId: number;
  brandId: number;
  isActive: boolean;
  images: ImageFormItem[];
  tags: string[];
  extraAttributes: ExtraAttributeFormItem[];
}
