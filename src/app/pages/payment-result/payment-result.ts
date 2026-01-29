import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-payment-result',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './payment-result.html',
    styleUrl: './payment-result.scss',
})
export class PaymentResult implements OnInit {
    private _route = inject(ActivatedRoute);

    status: string | null = '';
    paymentId: string | null = '';
    config = { title: '', message: '', icon: '', class: '' };

    ngOnInit() {
        this.status = this._route.snapshot.queryParamMap.get('status');
        this.paymentId = this._route.snapshot.queryParamMap.get('payment_id');

        this.setAppearance();
    }

    setAppearance() {
        switch (this.status) {
            
            case 'approved':
                this.config = {
                    title: '¡Pago Exitoso!',
                    message: 'Tu pedido ha sido procesado correctamente.',
                    icon: '✅',
                    class: 'approved',
                };
                console.log("Status de pago:", this.status);
                break;
            case 'rejected':
                this.config = {
                    title: 'Pago Rechazado',
                    message: 'Lo sentimos, hubo un problema con tu tarjeta.',
                    icon: '❌',
                    class: 'rejected',
                };
                console.log("Status de pago:", this.status);
                break;
            default: // pending o null
                this.config = {
                    title: 'Pago Pendiente',
                    message: 'Estamos esperando la confirmación de Mercado Pago.',
                    icon: '⏳',
                    class: 'pending',
                };
                console.log("Status de pago:", this.status);
        }
    }
}
