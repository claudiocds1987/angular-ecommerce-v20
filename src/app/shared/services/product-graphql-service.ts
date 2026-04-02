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
    query GetProducts($first: Int, $after: String, $last: Int, $before: String) {
      products(first: $first, after: $after, last: $last, before: $before) {
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

  /**
   * Obtiene productos paginados.
   * Acepta un objeto de parámetros para soportar navegación hacia adelante,
   * hacia atrás (última página) y búsquedas.
   */
  getProducts(params: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  }): Observable<{
    items: ProductAdminGrid[];
    totalItems: number;
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
  }> {
    const variables: any = {};

    // Prioridad a la navegación hacia atrás
    if (params.before) {
      variables.last = params.last || 25;
      variables.before = params.before;
    } else if (params.last) {
      variables.last = params.last;
    } else {
      variables.first = params.first || 25;
      if (params.after) variables.after = params.after;
    }

    return this._apollo
      .watchQuery<GraphQLProductResponse>({
        query: this.GET_PRODUCTS_QUERY,
        variables: variables,
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
            endCursor: data?.pageInfo?.endCursor || '',
            startCursor: data?.pageInfo?.startCursor || '', // Nuevo
          };
        }),
      );
  }

  /**
   * Mapea el nodo de GraphQL al modelo plano que espera la Grid de administración
   */
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
      // Cálculo de precio con descuento
      finalPrice: price && discount ? Number((price * (1 - discount / 100)).toFixed(2)) : price,
    };
  }
}
