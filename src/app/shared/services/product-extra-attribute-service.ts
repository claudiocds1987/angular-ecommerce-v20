import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductExtraAttribute } from '../models/product-extra-attribute.model';

@Injectable({
  providedIn: 'root',
})
export class ProductExtraAttributeService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = `${environment.serverUrl}/api/ProductExtraAttributes`;

  getExtraAttributesByCategory(categoryId: number): Observable<ProductExtraAttribute[]> {
    return this._http.get<ProductExtraAttribute[]>(`${this._baseUrl}/category/${categoryId}`);
  }
}
