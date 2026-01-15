/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartDto, MercadoPagoService } from '../../../shared/services/mercado-pago';

@Component({
    selector: 'app-order-summary',
    imports: [PrimaryButton],
    templateUrl: './order-summary.html',
    styleUrl: './order-summary.scss',
})
export class OrderSummary {
    cartService = inject(CartService);
    total = this.cartService.totalPrice;

    private _mercadoPagoService = inject(MercadoPagoService);

    onCheckout() {
        // 1. Mapeo de datos
        const dataParaBackend: CartDto = {
            items: this.cartService.cart().map((product) => ({
                name: product.title,
                quantity: product.quantity,
                price: product.price,
            })),
        };

        // 2. Obtener la preferencia del backend
        this._mercadoPagoService.createPreference(dataParaBackend).subscribe({
            next: (res) => {
                console.log('ID recibido:', res.id);

                // CLAVE: Acceder por string para evitar que el compilador lo cambie a "B"
                const MercadoPagoClass = (window as any)['MercadoPago'];

                if (MercadoPagoClass) {
                    try {
                        // Inicializar el SDK
                        const mp = new MercadoPagoClass(
                            'TEST-c3a31b76-ad93-4877-b3a9-fdefa8357b42',
                        );

                        // Abrir Checkout
                        mp.checkout({
                            preference: {
                                id: res.id,
                            },
                            autoOpen: true,
                        });
                    } catch (err) {
                        console.error('Error al instanciar MP:', err);
                    }
                } else {
                    alert('Error: No se encontró la librería de Mercado Pago.');
                }
            },
            error: (err) => console.error('Error en API:', err),
        });
    }

    /* onCheckout() {
        // 1. Mapear los datos del carrito
        const dataParaBackend: CartDto = {
            items: this.cartService.cart().map((product) => ({
                name: product.title,
                quantity: product.quantity,
                price: product.price,
            })),
        };

        this._mercadoPagoService.createPreference(dataParaBackend).subscribe({
            next: (res) => {
                console.log('Preference ID recibido:', res.id);

                try {
                    // 3. Inicializar dentro del flujo de éxito para asegurar que el SDK esté listo
                    const mp = new MercadoPago('TEST-c3a31b76-ad93-4877-b3a9-fdefa8357b42');

                    // 4. Abrir el Checkout Pro
                    mp.checkout({
                        preference: {
                            id: res.id,
                        },
                        autoOpen: true,
                    });
                } catch (e) {
                    console.error('Error al inicializar el SDK de Mercado Pago:', e);
                    alert('El SDK de Mercado Pago no cargó correctamente.');
                }
            },
            error: (err) => {
                console.error('Error al crear la preferencia', err);
                alert('Hubo un error al procesar el pago');
            },
        });
    } */
}
