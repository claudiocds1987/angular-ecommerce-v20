import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { ProductExtraAttribute } from '@features/products/models/product-extra-attribute.model';
import { ApiResponse } from '@features/admin-tools/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductExtraAttributeService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = `${environment.serverUrl}/api/ProductExtraAttributes`;

  getExtraAttributesByCategory(categoryId: number): Observable<ProductExtraAttribute[]> {
    return this._http.get<ProductExtraAttribute[]>(`${this._baseUrl}/category/${categoryId}`);
  }

  saveExtraAttributes(
    categoryId: number,
    attributes: ProductExtraAttribute[],
  ): Observable<ApiResponse> {
    return this._http.post<ApiResponse>(
      `${this._baseUrl}/save-extra-attributes/${categoryId}`,
      attributes,
    );
  }
}
