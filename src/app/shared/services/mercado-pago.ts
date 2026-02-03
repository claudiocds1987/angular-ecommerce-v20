/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

    createPreference(cart: CartDto): Observable<{ id: string; init_point: string; sandbox_init_point: string }> {
        // No añadas HttpHeaders manuales por ahora, deja que Angular lo gestione solo
        return this._http.post<{ id: string; init_point: string; sandbox_init_point: string }>(`${this._apiUrl}/create-preference`, cart);
    }

    // 2. Confirmar el pago
    confirmPayment(preferenceId: string, paymentId: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this._http.post(
            `${this._apiUrl}/confirm-payment`,
            {
                preferenceId,
                paymentId,
            },
            { headers },
        );
    }
}
