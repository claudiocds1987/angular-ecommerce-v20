import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { MyPurchaseItem, MyPurchasesFilters } from '../models/purchase.model';
import { Observable } from 'rxjs';

@Service()
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.serverUrl}/api/orders/my-purchases`;

  // Obtiene el historial de compras aprobadas solo del usuario que tiene una cuenta (usuario comprador, no para usuario invitado).
  getMyPurchases(userId: number, filters?: MyPurchasesFilters): Observable<MyPurchaseItem[]> {
    let params = new HttpParams().set('userId', userId.toString());

    if (filters?.dateFrom) {
      const dateFromIso =
        filters.dateFrom instanceof Date ? filters.dateFrom.toISOString() : filters.dateFrom;
      params = params.set('dateFrom', dateFromIso);
    }

    if (filters?.dateTo) {
      const dateToIso =
        filters.dateTo instanceof Date ? filters.dateTo.toISOString() : filters.dateTo;
      params = params.set('dateTo', dateToIso);
    }

    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }

    if (filters?.search && filters.search.trim().length > 0) {
      params = params.set('search', filters.search.trim());
    }

    return this.http.get<MyPurchaseItem[]>(this.apiUrl, { params });
  }
}
