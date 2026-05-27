export interface GQLCategory {
  id: number | string;
  name: string;
}

export interface GQLBrand {
  id: number | string;
  name: string;
}

export interface GQLProductNode {
  id: string | number;
  thumbnail: string;
  title: string;
  price: number;
  sku: string;
  stock: number;
  discountPercentage: number;
  category: GQLCategory | null;
  brand: GQLBrand | null;
  isActive: boolean;
}

export interface GraphQLProductResponse {
  products: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    nodes: GQLProductNode[];
  };
}
