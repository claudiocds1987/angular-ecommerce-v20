import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProductBrand } from '../models/product-brand.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.serverUrl}/api/brand`;

  getBrands(): Observable<ProductBrand[]> {
    return this._http.get<ProductBrand[]>(this._url);
  }
}
