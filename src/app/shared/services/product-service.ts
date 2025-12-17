import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private _http = inject(HttpClient);
    //private _apiUrl = 'https://dummyjson.com/products';
      private _apiUrl = 'https://fakestoreapi.com/products';

    // 1. Obtener todos los productos
    getProducts(): Observable<Product[]> {
        return this._http.get<Product[]>(this._apiUrl)
    }

    // 2. Obtener un solo producto por ID
    getProductById(id: number): Observable<Product> {
        return this._http.get<Product>(`${this._apiUrl}/${id}`);
    }

    // 3. Crear un nuevo producto
    createProduct(product: Product): Observable<Product> {
        return this._http.post<Product>(`${this._apiUrl}/add`, product);
    }

    // 4. Actualizar un producto (Update)
    updateProduct(id: number, product: Partial<Product>): Observable<Product> {
        return this._http.put<Product>(`${this._apiUrl}/${id}`, product);
    }

    // 5. Eliminar un producto
    deleteProduct(id: number): Observable<any> {
        return this._http.delete(`${this._apiUrl}/${id}`);
    }
}
