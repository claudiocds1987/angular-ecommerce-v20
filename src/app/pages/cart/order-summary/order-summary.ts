import { Component, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartDto, MercadoPagoService } from '../../../shared/services/mercado-pago';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
declare var MercadoPago: any;

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
    }
}
