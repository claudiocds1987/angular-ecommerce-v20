/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.production';


// Definimos interfaces para mantener el tipado fuerte de Angular
export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CartDto {
  items: CartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class MercadoPagoService {
 
    /**
   * La URL se construye tomando la base del environment.
   * Local: https://localhost:44364/api/MercadoPago
   * Producción: https://apicomponents.runasp.net/api/MercadoPago
   */
  private readonly _apiUrl = `${environment.serverUrl}/api/MercadoPago`;

  private readonly _http = inject(HttpClient);

  // 1. Enviar el carrito para obtener el ID de preferencia
  createPreference(cart: CartDto): Observable<{ id: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post<{ id: string }>(
      `${this._apiUrl}/create-preference`, 
      cart, 
      { headers }
    );
  }

  // 2. Confirmar el pago
  confirmPayment(preferenceId: string, paymentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post(`${this._apiUrl}/confirm-payment`, 
      {
        preferenceId,
        paymentId
      },
      { headers }
    );
  }
}