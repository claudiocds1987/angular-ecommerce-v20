/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartDto, MercadoPagoService } from '../../../shared/services/mercado-pago';
import { Subject, exhaustMap, Subscription, catchError, of } from 'rxjs';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [PrimaryButton],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummary implements OnInit, OnDestroy {
  cartService = inject(CartService);
  total = this.cartService.totalPrice;
  private _mercadoPagoService = inject(MercadoPagoService);

  private checkoutTrigger$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    // Inicializamos el escuchador al cargar el componente
    this.initCheckoutHandler();
  }

  private initCheckoutHandler() {
    this.subscription = this.checkoutTrigger$
      .pipe(
        // exhaustMap Ignora cualquier nuevo click hasta que la petición actual termine
        // Ej: Si el usuario está ansioso y clickea 5 veces, solo se procesará el primer click, evitando múltiples peticiones al backend.
        exhaustMap(() => {
          const dataParaBackend: CartDto = {
            items: this.cartService.cart().map((product) => ({
              name: product.title,
              quantity: product.quantity,
              price: product.finalPrice ? product.finalPrice : product.price,
            })),
          };

          // El catchError para asegurar que si la petición falla,
          // el exhaustMap se "libere" y permita nuevos clics.
          return this._mercadoPagoService.createPreference(dataParaBackend).pipe(
            catchError((err) => {
              console.error('Error en API:', err);
              alert('Hubo un error al procesar el pago. Intenta de nuevo.');
              return of(null);
            }),
          );
        }),
      )
      .subscribe((res) => {
        if (!res) return;

        // Priorizar el link de sandbox que viene del backend
        let url = res.sandbox_init_point || res.init_point;

        if (!url && res.id) {
          // Fallback: Si el backend no devuelve la URL completa
          url = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${res.id}`;
          console.warn(
            'Backend no devolvió sandbox_init_point, usando URL construida manualmente:',
            url,
          );
        }

        if (url) {
          window.location.href = url;
        } else {
          console.error('Error: No se recibió link ni ID de preferencia.', res);
          alert('Error: No se pudo generar el link de pago.');
        }
      });
  }

  onCheckout() {
    this.checkoutTrigger$.next();
  }

  isDisabled(): boolean {
    return this.cartService.cart().length === 0;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
