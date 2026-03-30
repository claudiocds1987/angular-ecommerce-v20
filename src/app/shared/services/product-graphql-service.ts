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
    query GetProducts($first: Int, $after: String) {
      products(first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          thumbnail
          title
          price
          sku
          stock
          discountPercentage
          category {
            name
          }
          brand {
            name
          }
        }
      }
    }
  `;

  // Método principal para obtener productos paginados por cursor
  getProducts(
    first: number,
    after?: string,
  ): Observable<{
    items: ProductAdminGrid[];
    totalItems: number;
    hasNextPage: boolean;
    endCursor: string;
  }> {
    return this._apollo
      .watchQuery<GraphQLProductResponse>({
        query: this.GET_PRODUCTS_QUERY,
        variables: { first, after },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map((result) => {
          const data = result.data?.products;

          return {
            // Forzamos el tipo en el map para que coincida con el mapeador
            items: (data?.nodes || []).map((node) =>
              this._mapGraphqlNodeToAdminProduct(node as GQLProductNode),
            ),
            totalItems: data?.totalCount || 0,
            hasNextPage: data?.pageInfo?.hasNextPage || false,
            endCursor: data?.pageInfo?.endCursor || '',
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
      // Cálculo finalPrice directamente aquí para evitar hacerlo en la UI, y asegurar de que siempre se actualice correctamente.
      finalPrice: price && discount ? Number((price * (1 - discount / 100)).toFixed(2)) : price,
    };
  }
}
