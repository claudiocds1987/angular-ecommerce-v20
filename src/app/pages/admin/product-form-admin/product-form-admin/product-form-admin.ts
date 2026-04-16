import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form-admin.html',
  styleUrl: './product-form-admin.scss',
})
export class ProductFormAdmin {
  productForm: FormGroup = this._createProductForm();

  private _activeRoute = inject(ActivatedRoute);
  private _operation = '';

  // Convirtiendo price y discountPercentage a signals para calcular precio final de forma reactiva
  private _priceValue = toSignal(this.productForm.get('price')!.valueChanges, {
    initialValue: this.productForm.get('price')?.value ?? 0,
  });

  private _discountValue = toSignal(this.productForm.get('discountPercentage')!.valueChanges, {
    initialValue: this.productForm.get('discountPercentage')?.value ?? 0,
  });

  // El computed ahora solo se despierta si uno de estos dos cambia
  finalPriceSig = computed(() => {
    const price = Number(this._priceValue()) || 0;
    const discount = Number(this._discountValue()) || 0;

    if (discount <= 0) return price;
    if (discount >= 100) return 0;

    return Number((price * (1 - discount / 100)).toFixed(2));
  });

  constructor() {
    this._getOperation();
    console.log('Operación:', this._operation); // Verificar el valor de la operación
  }

  onSubmit() {
    console.log('Form submitted with values:', this.productForm.value);
    /* if (this.productForm.valid) {
      if (this._operation === 'create') {} */
  }

  onNumberKeydown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ','];
    if (!allowedKeys.includes(event.key) && isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  private _createProductForm(): FormGroup {
    return new FormGroup({
      id: new FormControl<number>(0, { nonNullable: true }),
      title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      price: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      discountPercentage: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),
      rating: new FormControl<number>(0),
      stock: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      sku: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      weight: new FormControl<number>(0),
      width: new FormControl<number>(0),
      height: new FormControl<number>(0),
      depth: new FormControl<number>(0),
      warrantyInformation: new FormControl<string>(''),
      shippingInformation: new FormControl<string>(''),
      availabilityStatus: new FormControl<string>('instock'),
      returnPolicy: new FormControl<string>(''),
      minimumOrderQuantity: new FormControl<number>(1, { validators: [Validators.min(1)] }),
      thumbnail: new FormControl<string>(''),
      categoryId: new FormControl<number | null>(null, { validators: [Validators.required] }),
      brandId: new FormControl<number | null>(null, { validators: [Validators.required] }),
      isActive: new FormControl<boolean>(true, { nonNullable: true }),
      images: new FormArray([]),
    });
  }

  private _getOperation() {
    this._activeRoute.data.subscribe((data) => {
      this._operation = data['operation'];
    });
  }
}
