import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
//import { DummyResponsePaginated } from '../models/dummy-response.model';
import { environment } from '../../../environments/environment';
import { ProductPaginated } from '../models/product-paginated.model';

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
      tap((res) => console.log('🔎 Datos verificados:', res)),
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
    pageSize: number,
    query = '',
    category = '',
  ): Observable<ProductPaginated> {
    // Construimos los parámetros de búsqueda exactos que espera tu C#
    let url = `${this._apiURL}?page=${page}&size=${pageSize}`;

    if (category) {
      url += `&categoryId=${category}`;
    }
    if (query) {
      url += `&searchTerm=${query}`;
    }

    return this._http.get<ProductPaginated>(url).pipe(
      map((res: ProductPaginated): ProductPaginated => {
        return {
          ...res,
          items: res.items.map((p) => this._mapToProduct(p)),
        };
      }),
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

/* import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { DummyProduct, DummyResponsePaginated } from '../models/dummy-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _http = inject(HttpClient);
  //private _apiUrl = 'https://dummyjson.com/products';
  private _apiURL = `${environment.serverUrl}/api/products`;

  // Obtener productos paginados
  getProductsPaginated(limit: number, skip: number) {
    return this._http
      .get<DummyResponsePaginated>(`${this._apiURL}?limit=${limit}&skip=${skip}`)
      .pipe(
        map((res) => {
          // Transformamos cada producto de la API al modelo Product
          const mappedProducts: Product[] = res.products.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            category: p.category,
            stock: p.stock,
            discountPercentage: p.discountPercentage,
            rating: p.rating,
            image: p.thumbnail,
          }));

          return {
            products: mappedProducts,
            total: res.total,
          };
        }),
      );
  }

  getFilteredProducts(limit: number, skip: number, query = '', category = '') {
    let url = `${this._apiURL}?limit=${limit}&skip=${skip}`;

    if (category) {
      // Prioridad a la categoría sobre la búsqueda (limitación de DummyJSON)
      url = `${this._apiURL}/category/${category}?limit=${limit}&skip=${skip}`;
    } else if (query) {
      url = `${this._apiURL}/search?q=${query}&limit=${limit}&skip=${skip}`;
    }

    return this._http.get<DummyResponsePaginated>(url).pipe(
      map((res) => ({
        total: res.total,
        products: res.products.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          stock: p.stock,
          discountPercentage: p.discountPercentage,
          rating: p.rating,
          image: p.thumbnail,
        })),
      })),
    );
  }

  // 1. Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this._http.get<Product[]>(`${this._apiURL}?limit=194&skip=0`);
  }

  getProductById(id: number): Observable<DummyProduct> {
    return this._http.get<DummyProduct>(`${this._apiURL}/${id}`);
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

  getProductsCategoryList(): Observable<string[]> {
    return this._http.get<string[]>(`${this._apiURL}/category-list`);
  }
}
 */
