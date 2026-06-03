import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MercadoPagoService } from '@features/checkout/services/mercado-pago';
import { CartService } from '@features/checkout/services/cart-service';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.scss',
})
export class PaymentResult implements OnInit {
  private _route = inject(ActivatedRoute);
  private _mpService = inject(MercadoPagoService);
  private _cartService = inject(CartService);

  status: string | null = '';
  paymentId: string | null = '';
  preferenceId: string | null = '';

  config = { title: '', message: '', class: '' };

  ngOnInit() {
    this.status =
      this._route.snapshot.queryParamMap.get('status') ||
      this._route.snapshot.queryParamMap.get('collection_status');
    this.paymentId =
      this._route.snapshot.queryParamMap.get('payment_id') ||
      this._route.snapshot.queryParamMap.get('collection_id');
    this.preferenceId = this._route.snapshot.queryParamMap.get('preference_id');

    this.setAppearance();

    // 3. ENVIAMOS LA CONFIRMACIÓN AL BACKEND AUTOMÁTICAMENTE
    // Si Mercado Pago nos devolvió el ID de preferencia y el ID de pago, se lo mandamos al backend
    if (this.preferenceId && this.paymentId) {
      this._mpService
        .confirmPayment(this.preferenceId, this.paymentId, this.status || 'pending')
        .subscribe({
          next: (res) => {
            console.log('🚀 Base de datos de SQL Server actualizada con éxito:', res);
          },
          error: (err) => {
            console.error('❌ Error al intentar actualizar el estado de la orden:', err);
          },
        });
    } else {
      console.warn(
        '⚠️ No se pudo confirmar el pago en base de datos porque faltan parámetros en la URL.',
      );
    }
  }

  setAppearance() {
    switch (this.status) {
      case 'approved':
        this.config = {
          title: '¡Pago Exitoso!',
          message: 'Tu pedido ha sido procesado correctamente.',
          class: 'approved',
        };
        this._cartService.clearCart();
        break;
      case 'rejected':
        this.config = {
          title: 'Pago Rechazado',
          message: 'Lo sentimos, hubo un problema con tu tarjeta.',
          class: 'rejected',
        };
        break;
      default: // pending o null
        this.config = {
          title: 'Pago Pendiente',
          message: 'Estamos esperando la confirmación de Mercado Pago.',
          class: 'pending',
        };
    }
  }
}
