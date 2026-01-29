/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartDto, MercadoPagoService } from '../../../shared/services/mercado-pago';

@Component({
    selector: 'app-order-summary',
    imports: [PrimaryButton],
    templateUrl: './order-summary.html',
    styleUrl: './order-summary.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummary {
    cartService = inject(CartService);
    total = this.cartService.totalPrice;

    private _mercadoPagoService = inject(MercadoPagoService);

    onCheckout() {
        const dataParaBackend: CartDto = {
            items: this.cartService.cart().map((product) => ({
                name: product.title,
                quantity: product.quantity,
                price: product.finalPrice ? product.finalPrice : product.price,
            })),
        };

        this._mercadoPagoService.createPreference(dataParaBackend).subscribe({
            next: (res) => {
               
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
                            mode: 'redirect'
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

    isDisabled(): boolean {
        return this.cartService.cart().length === 0;
    }

}
