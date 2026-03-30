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
}

export interface GraphQLProductResponse {
  products: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: GQLProductNode[];
  };
}
