import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient, HttpParams } from '@angular/common/http';
//import { DummyResponsePaginated } from '../models/dummy-response.model';
import { environment } from '../../../environments/environment';
import { ProductPaginated } from '../models/product-paginated.model';
import { ProductFilterData } from '../models/product-filter-data.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _http = inject(HttpClient);
  private _apiURL = `${environment.serverUrl}/api/products`;

  /**
   * Función privada para transformar el producto del backend (DummyProduct)
   * al modelo de nuestra aplicación (Product), incluyendo el cálculo de precio final.
   */
  private _mapToProduct(p: Product): Product {
    return {
      ...p, // Esparcimos todas las propiedades que vienen del backend (sku, stock, tags, etc.)
      thumbnail: p.thumbnail,
      finalPrice:
        p.price && p.discountPercentage
          ? Number((p.price * (1 - p.discountPercentage / 100)).toFixed(2))
          : p.price,
    };
  }

  // Obtener productos paginados
  getProductsPaginated(pageNumber: number, pageSize: number): Observable<ProductPaginated> {
    const url = `${this._apiURL}?page=${pageNumber}&size=${pageSize}`;

    // 2. Tipamos el GET con la estructura real del JSON (BackendResponse)
    return this._http.get<ProductPaginated>(url).pipe(
      map((res): ProductPaginated => {
        // 3. Retornamos el modelo de Angular (ProductPaginated) mapeando las mayúsculas
        return {
          items: (res.items || []).map((p) => this._mapToProduct(p)),
          totalItems: res.totalItems,
          pageNumber: res.pageNumber,
          pageSize: res.pageSize,
          totalPages: res.totalPages,
        };
      }),
    );
  }

  // 3. Obtener filtrados (también debe devolver ProductPaginated)
  getFilteredProducts(
    page: number,
    size: number,
    filters: ProductFilterData,
  ): Observable<ProductPaginated> {
    let params = new HttpParams()
      .set('page', page.toString()) // Cambia a 'pageNo' si tu C# espera ese nombre
      .set('size', size.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('categoryId', filters.category);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.order) params = params.set('order', filters.order);

    return this._http.get<ProductPaginated>(`${this._apiURL}`, { params }).pipe(
      map((res) => ({
        ...res,
        // Mapeamos cada producto dentro del array 'items' para calcular el finalPrice
        items: res.items.map((p) => this._mapToProduct(p)),
      })),
    );
  }

  getProducts(): Observable<Product[]> {
    // Si no enviamos page/size, el backend devuelve todo según ProductService.cs
    return this._http
      .get<ProductPaginated>(this._apiURL)
      .pipe(map((res) => res.items.map((p) => this._mapToProduct(p))));
  }

  getProductById(id: number): Observable<Product> {
    return this._http.get<Product>(`${this._apiURL}/${id}`).pipe(map((p) => this._mapToProduct(p)));
  }

  createProduct(product: Product): Observable<Product> {
    return this._http.post<Product>(`${this._apiURL}/add`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this._http.put<Product>(`${this._apiURL}/${id}`, product);
  }

  // que no haga delete de de baja
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteProduct(id: number): Observable<any> {
    return this._http.delete(`${this._apiURL}/${id}`);
  }
}
