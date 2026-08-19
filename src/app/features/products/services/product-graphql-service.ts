/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import {
  GQLProductNode,
  GraphQLProductResponse,
} from '@features/products/models/graphql-product-response';
import { ProductAdminGrid } from '@features/products/models/product-admin-grid.model';

@Injectable({
  providedIn: 'root',
})
export class ProductGraphqlService {
  private _apollo = inject(Apollo);

  // ✅ Query ajustada para usar skip/take con items
  private readonly GET_PRODUCTS_QUERY = gql`
    query GetProducts(
      $skip: Int
      $take: Int
      $where: ProductFilterInput
      $order: [ProductSortInput!]
    ) {
      products(skip: $skip, take: $take, where: $where, order: $order) {
        totalCount
        items {
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

  getProducts(params: { skip?: number; take?: number; where?: any; order?: any }): Observable<{
    items: ProductAdminGrid[];
    totalItems: number;
  }> {
    return this._apollo
      .watchQuery<GraphQLProductResponse>({
        query: this.GET_PRODUCTS_QUERY,
        variables: params,
        fetchPolicy: 'cache-and-network', // o 'network-only'
      })
      .valueChanges.pipe(
        map((result) => {
          const data = result.data?.products;
          return {
            items: (data?.items || []).map((node) =>
              this._mapGraphqlNodeToAdminProduct(node as GQLProductNode),
            ),
            totalItems: data?.totalCount || 0,
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
