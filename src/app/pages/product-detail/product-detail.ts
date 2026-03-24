import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, Meta, Title } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../shared/services/product-service'; // Importa tu servicio
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../shared/services/cart-service';
import { ToastService } from '../../shared/services/toast-service';
import { ProductStore } from '../admin/state/product.store';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit {
  readonly productStore = inject(ProductStore);
  product = signal<Product | undefined>(undefined);
  safeThumbnail = signal<SafeResourceUrl>('');
  safeGallery = signal<SafeResourceUrl[]>([]);
  loading = signal<boolean>(true);

  brandName = computed(() => {
    const id = this.product()?.brandId;
    // Si el ID existe, lo busca en el mapa del Store, si no, muestra 'Cargando...'
    return id ? this.productStore.brandMap()[id] : 'Sin Marca';
  });

  // Selector reactivo para la categoría
  categoryName = computed(() => {
    const id = this.product()?.categoryId;
    return id ? this.productStore.categoryMap()[id] : 'Sin Categoría';
  });

  // Inyectamos la data (que es un Product completo o solo el ID)
  private _data = inject<Product>(MAT_DIALOG_DATA, { optional: true });
  private _productService = inject(ProductService);
  private _titleService = inject(Title);
  private _metaService = inject(Meta);
  private _sanitizer = inject(DomSanitizer);
  private _dialogRef = inject(MatDialogRef<ProductDetail>);
  private _cartService = inject(CartService);
  private _toastService = inject(ToastService);

  ngOnInit(): void {
    if (this._data) {
      // Si recibimos un objeto completo usamos el ID, si no, asumimos que es el ID directo
      const productId = typeof this._data === 'object' ? this._data.id : this._data;
      this._getProduct(productId);
    }
  }

  closeModal(): void {
    this._dialogRef.close();
  }

  addToCart(product: Product) {
    const isProductRepeated = this._cartService.checkItemsRepeated(product.id);

    if (isProductRepeated) {
      this._toastService.show(`El producto ya está en el carrito`, 'warning');
      return;
    }

    this._cartService.addToCart(product);
    this._toastService.show(`El producto se agregó al carrito`, 'success');
  }

  changeImage(img: SafeResourceUrl): void {
    this.safeThumbnail.set(img);
  }

  private _getProduct(id: number) {
    this.loading.set(true);
    this._productService.getProductById(id).subscribe({
      next: (product) => {
        // El servicio ya devuelve el producto con finalPrice calculado y mapeado
        this._processProductData(product);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private _processProductData(data: Product) {
    this.product.set(data);

    // Sanitización usando thumbnail (que es la propiedad oficial de tu nuevo modelo)
    if (data.thumbnail) {
      this.safeThumbnail.set(this._sanitizer.bypassSecurityTrustResourceUrl(data.thumbnail));
    }

    if (data.images && data.images.length > 0) {
      console.log('Imagen original:', data.images[0]);
      const images = data.images.map((img) =>
        this._sanitizer.bypassSecurityTrustResourceUrl(img.imageUrl),
      );
      this.safeGallery.set(images);
    }

    this._updateSeo(data);
  }

  private _updateSeo(p: Product) {
    // Usamos ?. por seguridad en caso de que brand sea opcional
    this._titleService.setTitle(`${p.title} ${p.brandId ? '| ' + p.brandId : ''}`);

    if (p.description) {
      this._metaService.updateTag({ name: 'description', content: p.description });
    }

    this._metaService.updateTag({ property: 'og:type', content: 'product' });
    this._metaService.updateTag({ property: 'og:price:amount', content: p.price.toString() });
    this._metaService.updateTag({ property: 'og:price:currency', content: 'USD' });
  }
}
