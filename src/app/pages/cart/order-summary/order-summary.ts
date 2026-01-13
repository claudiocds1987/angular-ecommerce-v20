import { Component, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartDto, MercadoPagoService } from '../../../shared/services/mercado-pago';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MercadoPago: any;

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
        // 1. Inicializar el SDK de Mercado Pago con tu Public Key
        const mp = new MercadoPago('TEST-c3a31b76-ad93-4877-b3a9-fdefa8357b42'); // no hay problema de seguridad porque es una public key de prueba

        // 2. Mapear los datos del carrito al DTO que espera tu Backend
        const dataParaBackend: CartDto = {
            items: this.cartService.cart().map(product => ({
                name: product.title,
                quantity: product.quantity, // O la cantidad que manejes en tu cartService
                price: product.price
            }))
        };

        console.log('Datos para backend:', dataParaBackend);

        // 3. Llamar a tu API para obtener el preferenceId
        this._mercadoPagoService.createPreference(dataParaBackend).subscribe({
            next: (res) => {
                console.log('Preference ID recibido:', res.id);
                // 4. Abrir el Checkout Pro de Mercado Pago
                mp.checkout({
                    preference: {
                        id: res.id
                    },
                    autoOpen: true // Abre el modal/ventana automáticamente
                });
            },
            error: (err) => {
                console.error('Error al crear la preferencia', err);
                alert('Hubo un error al procesar el pago');
            }
        });
    }

}
