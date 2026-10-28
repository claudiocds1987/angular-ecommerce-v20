import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { ProductReview } from '../models/product-review.model';

@Service()
export class ProductReviewService {
  private _http = inject(HttpClient);
  private _apiURL = `${environment.serverUrl}/api/reviews/product/`;

  getProductReviews(productId: number): Observable<ProductReview[]> {
    return this._http.get<ProductReview[]>(`${this._apiURL}${productId}`);
  }
}
