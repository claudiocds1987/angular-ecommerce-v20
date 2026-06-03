/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment'; // Ajustá según tu alias o ruta
import { CartDto } from '../models/cart-dto.model';

@Injectable({
  providedIn: 'root',
})
export class MercadoPagoService {
  private readonly _apiUrl = `${environment.serverUrl}/api/MercadoPago`;
  private readonly _http = inject(HttpClient);

  // 1. Enviar el DTO unificado al backend para obtener la preferencia
  createPreference(
    cart: CartDto,
  ): Observable<{ id: string; init_point: string; sandbox_init_point: string }> {
    return this._http.post<{ id: string; init_point: string; sandbox_init_point: string }>(
      `${this._apiUrl}/create-preference`,
      cart,
    );
  }

  // 2. Confirmar el pago optimizado con mapeo exacto para el DTO de C#
  confirmPayment(preferenceId: string, paymentId: string, status: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Armamos el cuerpo del JSON mapeando explícitamente las mayúsculas que espera el backend
    const body = {
      PreferenceId: preferenceId,
      PaymentId: paymentId,
      Status: status,
    };

    return this._http.post(`${this._apiUrl}/confirm-payment`, body, { headers });
  }
}
