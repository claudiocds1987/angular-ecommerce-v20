import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { DummyResponse } from '../models/dummy-response.model';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private _http = inject(HttpClient);
    private _apiUrl = 'https://dummyjson.com/products';
    //private _apiUrl = 'https://fakestoreapi.com/products';

    getDummys(limit: number, skip: number) {
    return this._http.get<DummyResponse>(`${this._apiUrl}?limit=${limit}&skip=${skip}`)
        .pipe(
            map(res => {
                // Transformamos cada producto de la API a tu interfaz Product
                const mappedProducts: Product[] = res.products.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    category: p.category,
                    rating: {
                        rate: p.rating, 
                        count: p.stock // count es el stock
                    },
                    // Usamos el thumbnail como imagen principal
                    image: p.thumbnail 
                }));

                return {
                    products: mappedProducts,
                    total: res.total
                };
            })
        );
}

    // 1. Obtener todos los productos
    getProducts(): Observable<Product[]> {
        return this._http.get<Product[]>(this._apiUrl);
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
