// src/app/features/checkout/components/cart/cart.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CartService } from '@features/checkout/services/cart-service';

import { CartItemComponent } from '../cart-item/cart-item';

import { Subject, Subscription, of } from 'rxjs';
import { exhaustMap, catchError } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';
import { MercadoPagoService } from '@features/checkout/services/mercado-pago';
import { CartDto } from '@features/checkout/models/cart-dto.model';
import { FormFieldError } from '@shared/components/form-field-error/form-field-error';
import { AuthStore } from '@features/auth/state/auth.store';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { signal } from '@angular/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    CartItemComponent,
    FormFieldError,
    PrimaryButton,
    Breadcrumb,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit, OnDestroy {
  breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Productos', url: '/' },
    { label: 'Carrito' }
  ]);

  // Inyecciones
  cartService = inject(CartService);
  private _fb = inject(FormBuilder);
  private _mpService = inject(MercadoPagoService);
  private _authStore = inject(AuthStore);

  // Formulario Reactivo del Paso 2 (Atado estrictamente a camelCase del backend)
  shippingForm!: FormGroup;

  // Manejo de streams asincrónicos para blindar el botón de compra
  private checkoutTrigger$ = new Subject<void>();
  private subscription = new Subscription();

  ngOnInit() {
    this.initForm();
    this.initCheckoutHandler();
  }

  private initForm() {
    this.shippingForm = this._fb.group({
      customerName: ['', [Validators.required, Validators.minLength(4)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
      shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
      shippingCity: ['', [Validators.required, Validators.minLength(3)]],
      shippingZipCode: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  private initCheckoutHandler() {
    this.subscription = this.checkoutTrigger$
      .pipe(
        // exhaustMap ignora múltiples clicks impulsivos mientras la API procesa
        exhaustMap(() => {
          const formValues = this.shippingForm.value;

          // Construcción quirúrgica del DTO unificado
          const dataParaBackend: CartDto = {
            userId: this._authStore.user()?.id || null, // En caso de no ser un usuario logueado, el id es null
            customerName: formValues.customerName,
            customerEmail: formValues.customerEmail,
            customerPhone: formValues.customerPhone,
            shippingAddress: formValues.shippingAddress,
            shippingCity: formValues.shippingCity,
            shippingZipCode: formValues.shippingZipCode,
            items: this.cartService.cart().map((product) => ({
              productId: product.id,
              quantity: product.quantity,
            })),
          };

          return this._mpService.createPreference(dataParaBackend).pipe(
            catchError((err) => {
              console.error('Error al generar preferencia:', err);
              alert('Hubo un error al procesar la orden de compra. Reintenta.');
              return of(null);
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res && res.id) {
            // URL oficial limpia para redirigir al Sandbox
            const urlSandbox = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${res.id}`;
            console.log('🚀 Redirigiendo a pasarela:', urlSandbox);
            window.location.href = urlSandbox;
          } else {
            alert('El servidor no retornó un ID de preferencia válido.');
          }
        },
        error: (err) => {
          console.error('Error al conectar con el backend:', err);
        },
      });
  }

  onBuy() {
    if (this.shippingForm.invalid || this.cartService.cart().length === 0) return;
    this.checkoutTrigger$.next();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
