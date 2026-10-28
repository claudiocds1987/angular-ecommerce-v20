import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TransferState, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { environment } from '@env/environment';
import { ProductReview } from '../models/product-review.model';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  private _http = inject(HttpClient);
  private _transferState = inject(TransferState);
  private _platformId = inject(PLATFORM_ID);
  private _apiURL = `${environment.serverUrl}/api/reviews/product`;

  getProductReviews(productId: number): Observable<ProductReview[]> {
    const STATE_KEY = makeStateKey<ProductReview[]>(`product-reviews-${productId}`);

    // transferState Verifica si el estado ya fue transferido desde el SSR
    const storedData = this._transferState.get(STATE_KEY, null);
    if (storedData) {
      this._transferState.remove(STATE_KEY);
      return of(storedData);
    }

    // 2. Si no está en caché, hacer la petición HTTP y guardarla si estamos en el servidor
    return this._http.get<ProductReview[]>(`${this._apiURL}/${productId}`).pipe(
      tap((reviews) => {
        if (isPlatformServer(this._platformId)) {
          this._transferState.set(STATE_KEY, reviews);
        }
      }),
    );
  }
}
