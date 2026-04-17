import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
import { CategoryStore } from '../../state/category.store';
import { BrandStore } from '../../state/brand.store';
import { ProductService } from '../../../../shared/services/product-service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form-admin.html',
  styleUrl: './product-form-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormAdmin {
  productForm: FormGroup = this._createProductForm();

  // Inyección de stores
  readonly categoryStore = inject(CategoryStore);
  readonly brandStore = inject(BrandStore);

  // cargando categorías y marcas cuando _initData() prende el motor en ambos stores con loadAll()
  categoriesSig = this.categoryStore.items;
  brandsSig = this.brandStore.items;

  // El computed solo se despierta si uno de estos dos cambia
  finalPriceSig = computed(() => {
    const price = Number(this._priceValue()) || 0;
    const discount = Number(this._discountValue()) || 0;

    if (discount <= 0) return price;
    if (discount >= 100) return 0;

    return Number((price * (1 - discount / 100)).toFixed(2));
  });

  private _productDataSig = signal<Product | null>(null);
  private readonly _productService = inject(ProductService);
  private _activeRoute = inject(ActivatedRoute);
  private _operation = this._activeRoute.snapshot.data['operation'];
  // Convirtiendo price y discountPercentage del form a signals para calcular precio final de forma reactiva
  private _priceValue = toSignal(this.productForm.get('price')!.valueChanges, {
    initialValue: this.productForm.get('price')?.value ?? 0,
  });

  private _discountValue = toSignal(this.productForm.get('discountPercentage')!.valueChanges, {
    initialValue: this.productForm.get('discountPercentage')?.value ?? 0,
  });

  constructor() {
    this._initData();

    // 2. effect para actualizar el formulario cuando se cargue todo el producto (en edición) cuando categorías y marcas estén disponibles (simil a forkJoin)
    effect(() => {
      const product = this._productDataSig();

      if (this.categoriesSig().length > 0 && this.brandsSig().length > 0 && product) {
        // untracked, le dice a Angular: "Ejecuta este código, pero no te quedes vigilando lo que pase aca adentro,
        // solo quiero que este effect reaccione a los cambios de product, categoriesSig y brandsSig que están afuera".
        // Evita disparar el effect si el formulario cambia internamente. (evitaría un loop infinito)
        untracked(() => {
          this.productForm.patchValue(product);
        });
      }
    });
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

  private _initData() {
    // Disparar catálogos
    this.categoryStore.loadAll();
    this.brandStore.loadAll();

    if (this._operation === 'edit') {
      const productId = Number(this._activeRoute.snapshot.paramMap.get('id'));

      this._productService
        .getProductById(productId)
        .subscribe((data) => this._productDataSig.set(data));
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
}
