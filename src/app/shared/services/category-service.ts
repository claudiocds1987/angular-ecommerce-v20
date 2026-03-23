import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductCategory } from '../models/product-category.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _http = inject(HttpClient);
  private _apiURL = `${environment.serverUrl}/api/category`;

  getCategories(): Observable<ProductCategory[]> {
    return this._http.get<ProductCategory[]>(`${this._apiURL}`);
  }
}
