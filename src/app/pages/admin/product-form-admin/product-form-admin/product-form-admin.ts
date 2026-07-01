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
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { CategoryStore } from '@features/products/state/category.store';
import { BrandStore } from '@features/products/state/brand.store';
import { ProductService } from '@features/products/services/product-service';
import { ExtraAttribute, Product } from '@features/products/models/product.model';
import { UploadImageComponent } from '@shared/components/upload-image/upload-image';
import { finalize, Observable, startWith } from 'rxjs';
import { SpinnerService } from '@shared/services/spinner-service';
import { ProductExtraAttributeService } from '@features/products/services/product-extra-attribute-service';
import { ProductExtraAttribute } from '@features/products/models/product-extra-attribute.model';
import { FormFieldError } from '../../../../shared/components/form-field-error/form-field-error';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { ToastService } from '@shared/services/toast-service';
import { CanComponentDeactivate } from '@core/guards/unsaved-changes.guard';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';

type AdminProductOperation = 'create' | 'edit';

interface ExtraAttributeFormRow {
  name: string;
  label: string;
  dataType: string;
  value: unknown;
}

interface ImageFormRow {
  id?: number | null;
  imageUrl: string;
}

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UploadImageComponent,
    FormFieldError,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    PrimaryButton,
    Breadcrumb,
    SkeletonDirective,
  ],
  templateUrl: './product-form-admin.html',
  styleUrls: ['./product-form-admin.scss', '../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormAdmin implements CanComponentDeactivate {
  breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Lista de productos', url: '/admin/products-grid-admin' },
    { label: 'Gestión del producto' },
  ]);

  isLoadingSig = signal<boolean>(true);

  private static readonly TAG_SANITIZE = /[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ ]/g;
  private static readonly NUMBER_NAV_KEYS = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    '.',
    ',',
  ];

  private readonly fb = inject(FormBuilder);
  private readonly spinnerService = inject(SpinnerService);
  private readonly productService = inject(ProductService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly productExtraAttributeService = inject(ProductExtraAttributeService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categoryStore = inject(CategoryStore);
  readonly brandStore = inject(BrandStore);
  private _router = inject(Router);
  private _confirmDialogService = inject(ConfirmDialogService);
  private _toastService = inject(ToastService);

  productForm: FormGroup = this._createProductForm();

  readonly categoriesSig = this.categoryStore.items;
  readonly brandsSig = this.brandStore.items;
  private readonly productDataSig = signal<Product | null>(null);
  private readonly operation = this.activeRoute.snapshot.data['operation'] as AdminProductOperation;

  private readonly priceValue = toSignal(this.productForm.get('price')!.valueChanges, {
    initialValue: this.productForm.get('price')?.value ?? 0,
  });

  private readonly discountValue = toSignal(
    this.productForm.get('discountPercentage')!.valueChanges,
    { initialValue: this.productForm.get('discountPercentage')?.value ?? 0 },
  );

  readonly categoryIdSig = toSignal(
    this.productForm
      .get('categoryId')!
      .valueChanges.pipe(startWith(this.productForm.get('categoryId')?.value)),
    { initialValue: this.productForm.get('categoryId')?.value },
  );

  readonly finalPriceSig = computed(() => {
    const price = Number(this.priceValue()) || 0;
    const discount = Number(this.discountValue()) || 0;
    if (discount <= 0) return price;
    if (discount >= 100) return 0;
    return Number((price * (1 - discount / 100)).toFixed(2));
  });

  // Aunque marca como no usado si esta usandose, es necesario para el formulario de extra atributos
  // Este effect "loadExtraAttributesEffect" escucha los cambios en el mat-select de categoría.
  // Cuando el usuario elige una categoría distinta, limpia o reconstruye el FormArray de atributos extra con los campos correspondientes.
  // Si estás en modo edición y ya había datos guardados para esa categoría, los vuelve a cargar en el formulario.
  // categoryIdSig(); se dispara/actualiza cada vez que se elije una categoria del mat-select
  // productDataSig() se dispara/actualiza cuando se carga un producto desde el backend en modo edición y se hace .set(...) con esos datos.
  private readonly loadExtraAttributesEffect = effect((onCleanup) => {
    const categoryId = this.categoryIdSig();
    const productData = this.productDataSig();

    if (!categoryId) {
      untracked(() => this.extraAttributesArray.clear());
      return;
    }
    // untracked evita que Angular registre como dependencias los signals leídos dentro.
    // Eso significa que, aunque cambien esos signals, no harán que se vuelva a ejecutar el effect.
    // En este caso no hay signals dentro de untracked, pero lo dejo por buenas prácticas.
    untracked(() => {
      const sub = this.productExtraAttributeService
        .getExtraAttributesByCategory(categoryId)
        .subscribe({
          next: (definitions) => {
            const saved: ExtraAttribute[] =
              this.operation === 'edit' && productData ? (productData.extraAttributes ?? []) : [];
            this.buildExtraAttributes(definitions, saved);
          },
        });
      onCleanup(() => sub.unsubscribe());
    });
  });

  constructor() {
    this._initData();
    effect(() => {
      const product = this.productDataSig();
      if (this.categoriesSig().length > 0 && this.brandsSig().length > 0 && product) {
        untracked(() => this.patchFormFromProduct(product));
      }
    });
    effect(() => {
      const categoriesReady = this.categoriesSig().length > 0;
      const brandsReady = this.brandsSig().length > 0;
      const productReady = this.operation === 'create' || this.productDataSig() !== null;
      // Si categorias, marcas y producto están cargados, se desactiva el skeleton
      if (categoriesReady && brandsReady && productReady) {
        untracked(() => this.isLoadingSig.set(false));
      }
    });
  }

  //
  canDeactivate(): Observable<boolean> | boolean {
    // Si no ha cambiado nada o el carrito esta vacío, dejamos salir sin preguntar
    if (!this.productForm.dirty) return true;

    // Si hay cambios, lanzamos tu servicio (que ya devuelve Observable<boolean>)
    return this._confirmDialogService.open({
      title: 'Tiene cambios sin guardar',
      message: '¿Deseas salir?',
      confirmLabel: 'Salir',
      cancelLabel: 'Continuar',
      confirmColor: 'warn',
    });
  }

  trackByAttributeName(index: number, extraAttributeName: string | undefined): string {
    return extraAttributeName || index.toString();
  }

  get tagsArray(): FormArray {
    return this.productForm.get('tags') as FormArray;
  }

  get extraAttributesArray(): FormArray {
    return this.productForm.get('extraAttributes') as FormArray;
  }

  isReadyToSave(): boolean {
    return this.productForm.valid && this.productForm.dirty;
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.spinnerService.show();

    const formValue = this.productForm.getRawValue();
    const productToSave = this.mapFormToProductPayload(formValue);

    const request =
      this.operation === 'create'
        ? this.productService.createProduct(productToSave)
        : this.productService.updateProduct(productToSave.id!, productToSave);

    request.pipe(finalize(() => this.spinnerService.hide())).subscribe({
      next: (product) => {
        this._handleSuccess(product);
        this.productForm.markAsPristine();
      },
      error: () => this._handleError(),
    });
  }

  addTag(input: HTMLInputElement): void {
    const rawValue = input.value.trim();
    if (!rawValue) return;

    const cleanTag = rawValue.replace(ProductFormAdmin.TAG_SANITIZE, '').trim();
    if (cleanTag && !this.tagsArray.value.includes(cleanTag)) {
      this.tagsArray.push(new FormControl(cleanTag));
    }
    input.value = '';
  }

  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  onNumberKeydown(event: KeyboardEvent): void {
    if (!ProductFormAdmin.NUMBER_NAV_KEYS.includes(event.key) && Number.isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  confirmCancel(): void {
    if (!this.productForm.dirty) {
      void this._router.navigate(['/admin']);
      return;
    }
    this._confirmDialogService
      .open({
        title: 'Salir sin guardar',
        message:
          'Hay cambios sin guardar. Si sales ahora, se perderán. ¿Deseas salir del panel de configuración?',
        confirmLabel: 'Salir sin guardar',
        cancelLabel: 'Seguir editando',
        confirmColor: 'warn',
      })
      .subscribe((confirmed) => {
        if (confirmed) void this._router.navigate(['/admin']);
      });
  }

  private patchFormFromProduct(product: Product): void {
    this.productForm.patchValue(product);

    this.tagsArray.clear();
    product.tags?.forEach((tagObj) => {
      this.tagsArray.push(new FormControl(tagObj.tagName));
    });
  }

  private buildExtraAttributes(
    definitions: ProductExtraAttribute[],
    savedValues: ExtraAttribute[] = [],
  ): void {
    const extraArray = this.extraAttributesArray;
    extraArray.clear({ emitEvent: false });

    definitions.forEach((def) => {
      const saved = savedValues.find((v) => v.name === def.name);
      const initialValue = this.resolveInitialExtraValue(def, saved);
      const validators = this.validatorsFromDefinition(def);

      extraArray.push(
        this.fb.group({
          id: [def.id || 0],
          name: [def.name],
          label: [def.label || def.name],
          dataType: [def.dataType],
          value: [initialValue, validators],
        }),
      );
    });

    extraArray.markAsPristine();
    this.cdr.detectChanges();
  }

  private resolveInitialExtraValue(
    def: ProductExtraAttribute,
    saved: ExtraAttribute | undefined,
  ): string | boolean {
    if (def.dataType === 'boolean') {
      return saved ? String(saved.value).toLowerCase() === 'true' : false;
    }
    return (saved?.value ?? '') as string;
  }

  private validatorsFromDefinition(def: ProductExtraAttribute): ValidatorFn[] {
    const v = def.validations;
    if (!v) return [];

    const validators: ValidatorFn[] = [];
    if (v.required) validators.push(Validators.required);
    if (v.minLength != null) validators.push(Validators.minLength(v.minLength));
    if (v.maxLength != null) validators.push(Validators.maxLength(v.maxLength));
    if (v.min !== undefined && v.min !== null) validators.push(Validators.min(v.min));
    if (v.max !== undefined && v.max !== null) validators.push(Validators.max(v.max));
    if (v.pattern) validators.push(Validators.pattern(v.pattern));
    return validators;
  }

  private mapFormToProductPayload(formValue: Record<string, unknown>): Product {
    const extraRows = (formValue['extraAttributes'] ?? []) as ExtraAttributeFormRow[];
    const formattedExtraAttributes = extraRows.map((attr) => ({
      name: attr.name,
      label: attr.label,
      dataType: attr.dataType,
      value: attr.dataType === 'boolean' ? String(!!attr.value) : String(attr.value ?? ''),
    }));

    const tagStrings = (formValue['tags'] ?? []) as string[];
    const imageRows = (formValue['images'] ?? []) as ImageFormRow[];
    const id = (formValue['id'] as number) || null;

    return {
      ...(formValue as unknown as Product),
      id: id ?? 0,
      price: Number(formValue['price']),
      discountPercentage: Number(formValue['discountPercentage']),
      stock: Number(formValue['stock']),
      extraAttributes: formattedExtraAttributes as ExtraAttribute[],
      tags: tagStrings.map((tag) => ({ tagName: tag }) as Product['tags'][number]),
      images: imageRows.map((img) => ({
        id: img.id || null,
        imageUrl: img.imageUrl,
        productId: id,
      })) as Product['images'],
    };
  }

  private _handleSuccess(product: Product): void {
    console.log('Producto guardado exitosamente:', product);
    this._toastService.show(`Producto ${product.title} guardado con éxito`, 'success');
  }

  private _handleError(): void {
    this._toastService.show(`Error al procesar el producto`, 'danger');
  }

  private _initData(): void {
    this.categoryStore.loadAll();
    this.brandStore.loadAll();

    if (this.operation === 'edit') {
      const productId = Number(this.activeRoute.snapshot.paramMap.get('id'));
      this.productService.getProductById(productId).subscribe((data) => {
        this.productDataSig.set(data);
      });
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
