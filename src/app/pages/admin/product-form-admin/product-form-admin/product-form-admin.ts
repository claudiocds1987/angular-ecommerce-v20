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
import { FormsModule } from '@angular/forms';
import {
  applyEach,
  form,
  FormField,
  max,
  min,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryStore } from '@features/categories/state/category.store';
import { BrandStore } from '@features/brands/state/brand.store';
import { ProductService } from '@features/products/services/product-service';
import { ExtraAttribute, Product } from '@features/products/models/product.model';
import { UploadImageComponent } from '@shared/components/upload-image/upload-image';
import { finalize, Observable } from 'rxjs';
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
import { Button } from '@shared/components/button/button';
import { ToastService } from '@shared/services/toast-service';
import { CanComponentDeactivate } from '@core/guards/unsaved-changes.guard';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';

type AdminProductOperation = 'create' | 'edit';

export interface ExtraAttributeFormItem {
  id: number;
  name: string;
  label: string;
  dataType: string;
  value: string | boolean;
}

export interface ImageFormItem {
  id?: number | string;
  imageUrl: string;
}

export interface ProductFormModel {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  sku: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  availabilityStatus: string;
  minimumOrderQuantity: number;
  thumbnail: string;
  categoryId: number;
  brandId: number;
  isActive: boolean;
  images: ImageFormItem[];
  tags: string[];
  extraAttributes: ExtraAttributeFormItem[];
}

const INITIAL_PRODUCT_MODEL: ProductFormModel = {
  id: 0,
  title: '',
  description: '',
  price: 0,
  discountPercentage: 0,
  stock: 0,
  sku: '',
  width: 0,
  height: 0,
  depth: 0,
  weight: 0,
  warrantyInformation: '',
  shippingInformation: '',
  returnPolicy: '',
  availabilityStatus: 'instock',
  minimumOrderQuantity: 1,
  thumbnail: '',
  categoryId: 0,
  brandId: 0,
  isActive: true,
  images: [],
  tags: [],
  extraAttributes: [],
};

@Component({
  selector: 'app-product-form-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
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
    Button,
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

  private readonly spinnerService = inject(SpinnerService);
  private readonly productService = inject(ProductService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly productExtraAttributeService = inject(ProductExtraAttributeService);

  readonly categoryStore = inject(CategoryStore);
  readonly brandStore = inject(BrandStore);
  private _router = inject(Router);
  private _confirmDialogService = inject(ConfirmDialogService);
  private _toastService = inject(ToastService);

  private readonly extraAttributeDefinitionsSig = signal<ProductExtraAttribute[]>([]);

  productModel = signal<ProductFormModel>({ ...INITIAL_PRODUCT_MODEL });

  productForm = form(this.productModel, (s) => {
    required(s.title, { message: 'El título es requerido' });
    required(s.description, { message: 'La descripción es requerida' });
    required(s.price, { message: 'El precio es requerido' });
    min(s.price, 0, { message: 'El precio no puede ser negativo' });
    min(s.discountPercentage, 0, { message: 'El descuento no puede ser menor a 0%' });
    max(s.discountPercentage, 100, { message: 'El descuento no puede ser mayor a 100%' });
    required(s.stock, { message: 'El stock es requerido' });
    min(s.stock, 0, { message: 'El stock no puede ser negativo' });
    required(s.sku, { message: 'El SKU es requerido' });
    required(s.minimumOrderQuantity, { message: 'La cantidad mínima es requerida' });
    min(s.minimumOrderQuantity, 1, { message: 'La cantidad mínima debe ser al menos 1' });
    required(s.thumbnail, { message: 'La imagen principal es requerida' });

    validate(s.categoryId, ({ value }) => {
      return value() > 0
        ? undefined
        : { kind: 'required', message: 'Debe seleccionar una categoría' };
    });

    validate(s.brandId, ({ value }) => {
      return value() > 0 ? undefined : { kind: 'required', message: 'Debe seleccionar una marca' };
    });

    applyEach(s.extraAttributes, (attr) => {
      validate(attr.value, ({ value, valueOf }) => {
        const attrName = valueOf(attr.name);
        const def = this.extraAttributeDefinitionsSig().find((d) => d.name === attrName);
        const validations = def?.validations;
        if (!validations) return undefined;

        const dataType = valueOf(attr.dataType);
        if (dataType === 'boolean') {
          return undefined;
        }

        const val = value();
        const strVal = String(val ?? '').trim();

        if (validations.required && (!strVal || strVal === '')) {
          return { kind: 'required', message: 'Este campo es obligatorio.' };
        }

        if (!strVal) return undefined;

        if (validations.minLength != null && strVal.length < validations.minLength) {
          return { kind: 'minlength', message: `Mínimo ${validations.minLength} caracteres.` };
        }

        if (validations.maxLength != null && strVal.length > validations.maxLength) {
          return { kind: 'maxlength', message: `Máximo ${validations.maxLength} caracteres.` };
        }

        if (dataType === 'number') {
          const numVal = Number(strVal);
          if (Number.isNaN(numVal)) {
            return { kind: 'pattern', message: 'El valor debe ser un número válido.' };
          }
          if (validations.min != null && numVal < validations.min) {
            return {
              kind: 'min',
              message: `El valor debe ser mayor o igual a ${validations.min}.`,
            };
          }
          if (validations.max != null && numVal > validations.max) {
            return {
              kind: 'max',
              message: `El valor debe ser menor o igual a ${validations.max}.`,
            };
          }
        }

        if (validations.pattern) {
          const regex = new RegExp(validations.pattern);
          if (!regex.test(strVal)) {
            return { kind: 'pattern', message: 'El formato introducido no es válido.' };
          }
        }

        return undefined;
      });
    });
  });

  readonly categoriesSig = this.categoryStore.items;
  readonly brandsSig = this.brandStore.items;
  private readonly productDataSig = signal<Product | null>(null);
  private readonly operation = this.activeRoute.snapshot.data['operation'] as AdminProductOperation;

  readonly categoryIdSig = computed(() => this.productModel().categoryId);

  readonly finalPriceSig = computed(() => {
    const price = Number(this.productModel().price) || 0;
    const discount = Number(this.productModel().discountPercentage) || 0;
    if (discount <= 0) return price;
    if (discount >= 100) return 0;
    return Number((price * (1 - discount / 100)).toFixed(2));
  });

  private readonly loadExtraAttributesEffect = effect((onCleanup) => {
    const categoryId = this.categoryIdSig();
    const productData = this.productDataSig();

    if (!categoryId) {
      untracked(() => {
        this.extraAttributeDefinitionsSig.set([]);
        this.productModel.update((m) => ({ ...m, extraAttributes: [] }));
      });
      return;
    }

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
      if (categoriesReady && brandsReady && productReady) {
        untracked(() => this.isLoadingSig.set(false));
      }
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.productForm().dirty()) return true;

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

  isReadyToSave(): boolean {
    return this.productForm().valid() && this.productForm().dirty();
  }

  onSubmit(): void {
    submit(this.productForm, async () => {
      this.spinnerService.show();

      const formValue = this.productModel();
      const productToSave = this.mapFormToProductPayload(formValue);

      const request =
        this.operation === 'create'
          ? this.productService.createProduct(productToSave)
          : this.productService.updateProduct(productToSave.id, productToSave);

      request.pipe(finalize(() => this.spinnerService.hide())).subscribe({
        next: (product) => {
          this._handleSuccess(product);
          this.productForm().reset();
        },
        error: () => this._handleError(),
      });
    });
  }

  addTag(input: HTMLInputElement): void {
    const rawValue = input.value.trim();
    if (!rawValue) return;

    const cleanTag = rawValue.replace(ProductFormAdmin.TAG_SANITIZE, '').trim();
    if (cleanTag && !this.productModel().tags.includes(cleanTag)) {
      this.productModel.update((m) => ({
        ...m,
        tags: [...m.tags, cleanTag],
      }));
    }
    input.value = '';
  }

  removeTag(index: number): void {
    this.productModel.update((m) => ({
      ...m,
      tags: m.tags.filter((_, i) => i !== index),
    }));
  }

  onNumberKeydown(event: KeyboardEvent): void {
    if (!ProductFormAdmin.NUMBER_NAV_KEYS.includes(event.key) && Number.isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  confirmCancel(): void {
    if (!this.productForm().dirty()) {
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
    const tags = product.tags?.map((tagObj) => tagObj.tagName) ?? [];
    this.productModel.update((m) => ({
      ...m,
      id: product.id ?? 0,
      title: product.title ?? '',
      description: product.description ?? '',
      price: product.price ?? 0,
      discountPercentage: product.discountPercentage ?? 0,
      stock: product.stock ?? 0,
      sku: product.sku ?? '',
      width: product.width ?? 0,
      height: product.height ?? 0,
      depth: product.depth ?? 0,
      weight: product.weight ?? 0,
      warrantyInformation: product.warrantyInformation ?? '',
      shippingInformation: product.shippingInformation ?? '',
      returnPolicy: product.returnPolicy ?? '',
      availabilityStatus: product.availabilityStatus ?? 'instock',
      minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
      thumbnail: product.thumbnail ?? '',
      categoryId: product.categoryId ?? 0,
      brandId: product.brandId ?? 0,
      isActive: product.isActive ?? true,
      images: (product.images ?? []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
      tags,
    }));
    this.productForm().reset();
  }

  private buildExtraAttributes(
    definitions: ProductExtraAttribute[],
    savedValues: ExtraAttribute[] = [],
  ): void {
    this.extraAttributeDefinitionsSig.set(definitions);
    const extraAttributes: ExtraAttributeFormItem[] = definitions.map((def) => {
      const saved = savedValues.find((v) => v.name === def.name);
      const initialValue = this.resolveInitialExtraValue(def, saved);

      return {
        id: def.id || 0,
        name: def.name,
        label: def.label || def.name,
        dataType: def.dataType,
        value: initialValue,
      };
    });

    this.productModel.update((m) => ({
      ...m,
      extraAttributes,
    }));
    this.productForm().reset();
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

  private mapFormToProductPayload(formValue: ProductFormModel): Product {
    const currentProduct = this.productDataSig();
    const formattedExtraAttributes: ExtraAttribute[] = formValue.extraAttributes.map((attr) => ({
      name: attr.name,
      label: attr.label,
      dataType: attr.dataType as ExtraAttribute['dataType'],
      value: attr.dataType === 'boolean' ? String(!!attr.value) : String(attr.value ?? ''),
    }));

    const id = formValue.id || (currentProduct?.id ?? 0);

    return {
      ...(currentProduct ?? {}),
      ...formValue,
      id,
      price: Number(formValue.price) || 0,
      discountPercentage: Number(formValue.discountPercentage) || 0,
      stock: Number(formValue.stock) || 0,
      width: Number(formValue.width) || 0,
      height: Number(formValue.height) || 0,
      depth: Number(formValue.depth) || 0,
      weight: Number(formValue.weight) || 0,
      minimumOrderQuantity: Number(formValue.minimumOrderQuantity) || 1,
      rating: currentProduct?.rating ?? 0,
      reviewCount: currentProduct?.reviewCount ?? 0,
      reviews: currentProduct?.reviews ?? [],
      extraAttributes: formattedExtraAttributes,
      tags: formValue.tags.map((tag) => ({ tagName: tag }) as Product['tags'][number]),
      images: formValue.images.map((img) => ({
        id: Number(img.id) || 0,
        imageUrl: img.imageUrl,
        productId: id,
      })) as Product['images'],
    };
  }

  private _handleSuccess(product: Product): void {
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
}
