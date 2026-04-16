import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { GQLProductNode, GraphQLProductResponse } from '../models/graphql-product-response';
import { ProductAdminGrid } from '../models/product-admin-grid.model';

@Injectable({
  providedIn: 'root',
})
export class ProductGraphqlService {
  private _apollo = inject(Apollo);

  private readonly GET_PRODUCTS_QUERY = gql`
    query GetProducts(
      $first: Int
      $after: String
      $last: Int
      $before: String
      $where: ProductFilterInput
      $order: [ProductSortInput!]
    ) {
      products(
        first: $first
        after: $after
        last: $last
        before: $before
        where: $where
        order: $order
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        nodes {
          id
          thumbnail
          title
          price
          sku
          stock
          discountPercentage
          isActive
          category {
            id
            name
          }
          brand {
            id
            name
          }
        }
      }
    }
  `;

  getProducts(params: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
    where?: any;
    order?: any;
  }): Observable<{
    items: ProductAdminGrid[];
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  }> {
    return this._apollo
      .watchQuery<GraphQLProductResponse>({
        query: this.GET_PRODUCTS_QUERY,
        variables: params,
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map((result) => {
          const data = result.data?.products;
          return {
            items: (data?.nodes || []).map((node) =>
              this._mapGraphqlNodeToAdminProduct(node as GQLProductNode),
            ),
            totalItems: data?.totalCount || 0,
            hasNextPage: data?.pageInfo?.hasNextPage || false,
            hasPreviousPage: data?.pageInfo?.hasPreviousPage || false,
            endCursor: data?.pageInfo?.endCursor || '',
            startCursor: data?.pageInfo?.startCursor || '',
          };
        }),
      );
  }

  private _mapGraphqlNodeToAdminProduct(node: GQLProductNode): ProductAdminGrid {
    const price = node.price || 0;
    const discount = node.discountPercentage || 0;
    return {
      id: node.id ?? 0,
      title: node.title || 'Sin título',
      price: price,
      sku: node.sku ?? 'Sin SKU',
      stock: node.stock ?? 0,
      thumbnail: node.thumbnail ?? '',
      categoryId: node.category?.id || 0,
      brandId: node.brand?.id || 0,
      categoryName: node.category?.name || 'Sin Categoría',
      brandName: node.brand?.name || 'Sin Marca',
      discountPercentage: discount,
      isActive: node.isActive,
      finalPrice: price && discount ? Number((price * (1 - discount / 100)).toFixed(2)) : price,
    };
  }
}
