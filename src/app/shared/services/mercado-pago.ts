import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.local';


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
 
    //private _apiUrl = 'https://localhost:44364/api/MercadoPago';
    //private _apiUrl = 'https://apicomponents.runasp.net/api/MercadoPago';
   /**
   * La URL se construye tomando la base del environment.
   * En local será: https://localhost:44364/api/MercadoPago
   * En producción será: https://apicomponents.runasp.net/api/MercadoPago
   */
  private readonly _apiUrl = `${environment.serverUrl}/api/MercadoPago`;

  private readonly _http = inject(HttpClient);

 
  // 1. Enviar el carrito para obtener el ID de preferencia
  // Aca se envían los productos y el backend devuelve el "ticket" para que el usuario pueda pagar.
  createPreference(cart: CartDto): Observable<{ id: string }> {
    return this._http.post<{ id: string }>(`${this._apiUrl}/create-preference`, cart);
  }

  // 2. Confirmar el pago (según tu Swagger: confirm-payment)
  // Cuando el usuario termina de pagar, Mercado Pago lo devuelve a mi web. 
  // En ese momento, se puede tomar el paymentId de la URL y mandárselo a este endpoint para que el backend marque la orden como "Pagada".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmPayment(preferenceId: string, paymentId: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/confirm-payment`, {
      preferenceId,
      paymentId
    });
  }
}