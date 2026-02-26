import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { DummyProduct, DummyResponsePaginated } from '../models/dummy-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private _http = inject(HttpClient);
  private _apiUrl = 'https://dummyjson.com/products';

  // Obtener productos paginados
  getProductsPaginated(limit: number, skip: number) {
    return this._http
      .get<DummyResponsePaginated>(`${this._apiUrl}?limit=${limit}&skip=${skip}`)
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
    let url = `${this._apiUrl}?limit=${limit}&skip=${skip}`;

    if (category) {
      // Prioridad a la categoría sobre la búsqueda (limitación de DummyJSON)
      url = `${this._apiUrl}/category/${category}?limit=${limit}&skip=${skip}`;
    } else if (query) {
      url = `${this._apiUrl}/search?q=${query}&limit=${limit}&skip=${skip}`;
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
    return this._http.get<Product[]>(this._apiUrl);
  }

  getProductById(id: number): Observable<DummyProduct> {
    return this._http.get<DummyProduct>(`${this._apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this._http.post<Product>(`${this._apiUrl}/add`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this._http.put<Product>(`${this._apiUrl}/${id}`, product);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteProduct(id: number): Observable<any> {
    return this._http.delete(`${this._apiUrl}/${id}`);
  }

  getProductsCategoryList(): Observable<string[]> {
    return this._http.get<string[]>(`${this._apiUrl}/category-list`);
  }
}
