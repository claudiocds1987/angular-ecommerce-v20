import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // Cambiá esto por la URL de tu API en MonsterASP cuando hagas el deploy
    private apiUrl = 'https://localhost:44364/api/MercadoPago';

  constructor(private http: HttpClient) {}

  // 1. Enviar el carrito para obtener el ID de preferencia
  // Aca se envían los productos y el backend devuelve el "ticket" para que el usuario pueda pagar.
  createPreference(cart: CartDto): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.apiUrl}/create-preference`, cart);
  }

  // 2. Confirmar el pago (según tu Swagger: confirm-payment)
  // Cuando el usuario termina de pagar, Mercado Pago lo devuelve a mi web. 
  // En ese momento, se puede tomar el paymentId de la URL y mandárselo a este endpoint para que el backend marque la orden como "Pagada".
  confirmPayment(preferenceId: string, paymentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-payment`, {
      preferenceId,
      paymentId
    });
  }
}