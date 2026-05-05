/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  FormBuilder,
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
import { UploadImageComponent } from '../../../../shared/components/upload-image/upload-image';
import { finalize, startWith } from 'rxjs';
import { SpinnerService } from '../../../../shared/services/spinner-service';
import { ProductExtraAttributeService } from '../../../../shared/services/product-extra-attribute-service';
import { ProductExtraAttribute } from '../../../../shared/models/product-extra-attribute.model';

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UploadImageComponent],
  templateUrl: './product-form-admin.html',
  styleUrl: './product-form-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormAdmin {
  private readonly fb = inject(FormBuilder);
  private readonly _spinnerService = inject(SpinnerService);
  private readonly _productService = inject(ProductService);
  private readonly _activeRoute = inject(ActivatedRoute);
  private _productExtraAttributeService = inject(ProductExtraAttributeService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private _isInitialLoad = true; // bandera para saber si es 1ra vez que se carga el componente

  readonly categoryStore = inject(CategoryStore);
  readonly brandStore = inject(BrandStore);

  productForm: FormGroup = this._createProductForm();

  categoriesSig = this.categoryStore.items;
  brandsSig = this.brandStore.items;
  private _productDataSig = signal<Product | null>(null);
  private _operation = this._activeRoute.snapshot.data['operation'];

  private _priceValue = toSignal(this.productForm.get('price')!.valueChanges, {
    initialValue: this.productForm.get('price')?.value ?? 0,
  });

  private _discountValue = toSignal(this.productForm.get('discountPercentage')!.valueChanges, {
    initialValue: this.productForm.get('discountPercentage')?.value ?? 0,
  });

  categoryIdSig = toSignal(
    this.productForm
      .get('categoryId')!
      .valueChanges.pipe(startWith(this.productForm.get('categoryId')?.value)),
    { initialValue: this.productForm.get('categoryId')?.value },
  );

  finalPriceSig = computed(() => {
    const price = Number(this._priceValue()) || 0;
    const discount = Number(this._discountValue()) || 0;
    if (discount <= 0) return price;
    if (discount >= 100) return 0;
    return Number((price * (1 - discount / 100)).toFixed(2));
  });

  // Ahora el efecto maneja directamente la carga de atributos
  loadExtraAttributes = effect(() => {
    const categoryId = this.categoryIdSig();
    const productData = this._productDataSig();

    if (!categoryId) {
      untracked(() => this.extraAttributesArray.clear());
      return;
    }

    untracked(() => {
      // Si es la carga inicial y ya tenemos los datos del producto,
      // detenemos este efecto porque el efecto del constructor ya se encargó.
      if (this._isInitialLoad && this._operation === 'edit' && productData) {
        this._isInitialLoad = false; // Marcamos que la inicialización terminó
        return;
      }

      this._productExtraAttributeService
        .getExtraAttributesByCategory(categoryId)
        .subscribe((attributes) => {
          // Al venir del servicio tras un cambio de categoría,
          // mandamos [] para que los campos aparezcan vacíos.
          this._buildExtraAttributes(attributes, []);
          this._isInitialLoad = false;
        });
    });
  });

  constructor() {
    this._initData();

    effect(() => {
      const product = this._productDataSig();
      if (this.categoriesSig().length > 0 && this.brandsSig().length > 0 && product) {
        untracked(() => {
          this.productForm.patchValue(product);

          this.tagsArray.clear();
          if (product.tags?.length > 0) {
            product.tags.forEach((tagObj) => {
              this.tagsArray.push(new FormControl(tagObj.tagName));
            });
          }
          // Si estamos editando, pasamos los valores previos de atributos
          this._buildExtraAttributes(product.extraAttributes ?? [], product.extraAttributes ?? []);
        });
      }
    });
  }

  private _buildExtraAttributes(
    attributes: ProductExtraAttribute[],
    productValues: ProductExtraAttribute[] = [],
  ) {
    const extraArray = this.extraAttributesArray;

    // 1. LIMPIEZA NIVEL 1: Forzar valores nulos y emitir el cambio
    // Esto asegura que Angular sepa que los controles actuales ya no tienen valor.
    extraArray.controls.forEach((control) => {
      control.get('value')?.setValue('', { emitEvent: true });
    });

    // 2. LIMPIEZA NIVEL 2: Vaciar el array completamente
    extraArray.clear({ emitEvent: false });
    extraArray.reset([], { emitEvent: false });

    // 3. RECONSTRUCCIÓN CON NUEVOS OBJETOS
    // Al crear nuevos FormGroups, Angular debería detectar que son instancias distintas.
    attributes.forEach((attr) => {
      const foundValue = productValues.find((v) => v.name === attr.name);
      let initialValue: any = '';

      if (attr.dataType === 'boolean') {
        initialValue = foundValue ? String(foundValue.value).toLowerCase() === 'true' : false;
      } else {
        // Importante: si no hay valor previo, garantizamos que sea un string vacío explícito
        initialValue = foundValue?.value ?? '';
      }

      extraArray.push(
        this.fb.group({
          name: [attr.name],
          value: [initialValue],
          label: [attr.label || attr.name],
          dataType: [attr.dataType],
        }),
      );
    });

    // 4. LIMPIEZA NIVEL 3: Notificar a la vista y resetear estados de validación
    extraArray.markAsPristine();
    extraArray.markAsUntouched();

    // Forzamos la detección de cambios para que el DOM se entere de la nueva estructura
    this._cdr.detectChanges();
  }

  trackByAttributeName(index: number, attrGroup: any): string {
    return attrGroup.get('name')?.value || index.toString();
  }

  get tagsArray() {
    return this.productForm.get('tags') as FormArray;
  }

  get extraAttributesArray(): FormArray {
    return this.productForm.get('extraAttributes') as FormArray;
  }

  isReadyToSave(): boolean {
    return this.productForm.valid && this.productForm.dirty;
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this._spinnerService.show();

    const formValue = this.productForm.getRawValue();

    // Procesamos los atributos asegurando que el valor capturado sea el del input
    const formattedExtraAttributes = (formValue.extraAttributes || []).map((attr: any) => {
      let finalValue = attr.value;

      // Si es booleano, nos aseguramos de enviar "true" o "false" como string
      if (attr.dataType === 'boolean') {
        finalValue = String(!!attr.value);
      } else {
        // Para text y number, si es null o undefined enviamos string vacío
        finalValue = String(attr.value ?? '');
      }

      return {
        name: attr.name,
        label: attr.label,
        dataType: attr.dataType,
        value: finalValue,
      };
    });

    const productToSave: any = {
      ...formValue,
      id: formValue.id || null,
      price: Number(formValue.price),
      discountPercentage: Number(formValue.discountPercentage),
      stock: Number(formValue.stock),
      // 2. Asignamos los atributos ya normalizados
      extraAttributes: formattedExtraAttributes,
      tags: formValue.tags.map((tag: string) => ({ tagName: tag })),
      images: (formValue.images || []).map((img: any) => ({
        id: img.id || null,
        imageUrl: img.imageUrl,
        productId: formValue.id || null,
      })),
    };

    const request =
      this._operation === 'create'
        ? this._productService.createProduct(productToSave)
        : this._productService.updateProduct(productToSave.id!, productToSave);

    request.pipe(finalize(() => this._spinnerService.hide())).subscribe({
      next: (product) => this._handleSuccess(product),
      error: (err) => this._handleError(err),
    });
  }

  addTag(input: HTMLInputElement) {
    const rawValue = input.value.trim();
    if (rawValue) {
      const cleanTag = rawValue.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ ]/g, '').trim();
      if (cleanTag && !this.tagsArray.value.includes(cleanTag)) {
        this.tagsArray.push(new FormControl(cleanTag));
      }
      input.value = '';
    }
  }

  removeTag(index: number) {
    this.tagsArray.removeAt(index);
  }

  onNumberKeydown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ','];
    if (!allowedKeys.includes(event.key) && isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  private _handleSuccess(product: Product): void {
    alert(`Producto ${product.title} guardado con éxito`);
  }

  private _handleError(err: any): void {
    alert(`Error al procesar el producto`);
  }

  private _initData() {
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
    return this.fb.group({
      id: [0],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      sku: ['', [Validators.required]],
      width: [0],
      height: [0],
      depth: [0],
      weight: [0],
      warrantyInformation: [''],
      shippingInformation: [''],
      returnPolicy: [''],
      availabilityStatus: ['instock'],
      minimumOrderQuantity: [1, [Validators.required, Validators.min(1)]],
      thumbnail: ['', [Validators.required]],
      categoryId: [null, [Validators.required]],
      brandId: [null, [Validators.required]],
      isActive: [true],
      images: [[]],
      tags: this.fb.array([]),
      extraAttributes: this.fb.array([]),
    });
  }
}
