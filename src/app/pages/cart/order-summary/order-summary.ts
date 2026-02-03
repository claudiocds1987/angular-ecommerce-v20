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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        // Priorizar el link de sandbox que viene del backend
        let url = res.sandbox_init_point || res.init_point;

        if (!url && res.id) {
          // Fallback: Si el backend no devuelve la URL completa (común en algunas implementaciones),
          // la construimos manualmente usando el ID de preferencia.
          // Nota: Asumimos Sandbox (.com.ar) dado el token de prueba.
          url = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${res.id}`;
          console.warn(
            'Backend no devolvió sandbox_init_point, usando URL construida manualmente:',
            url,
          );
        }

        if (url) {
          // Redirigir en la misma pestaña
          window.location.href = url;
        } else {
          console.error('Error: No se recibió link ni ID de preferencia.', res);
          alert('Error: No se pudo generar el link de pago.');
        }
      },
      error: (err) => console.error('Error en API:', err),
    });
  }

  isDisabled(): boolean {
    return this.cartService.cart().length === 0;
  }
}
