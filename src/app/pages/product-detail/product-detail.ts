import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, Meta, Title } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DummyProduct } from '../../shared/models/dummy-response.model';
import { ProductService } from '../../shared/services/product-service'; // Importa tu servicio
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../shared/services/cart-service';
import { ToastService } from '../../shared/services/toast-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit {
  dummyProduct = signal<DummyProduct | undefined>(undefined);
  safeThumbnail = signal<SafeResourceUrl>('');
  safeGallery = signal<SafeResourceUrl[]>([]);
  loading = signal<boolean>(true);

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
      const productId = typeof this._data === 'object' ? this._data.id : this._data;
      this._getProduct(productId);
    }
  }

  closeModal(): void {
    this._dialogRef.close();
  }

  addToCart(dummyProduct: DummyProduct) {
    const isProductRepeated = this._cartService.checkItemsRepeated(dummyProduct.id);
    if (isProductRepeated) {
      this._toastService.show(`El producto ya esta en el carrito`, 'warning');
      return;
    }
    const product: Product = {
      id: dummyProduct.id,
      title: dummyProduct.title,
      price: dummyProduct.price,
      finalPrice: dummyProduct.finalPrice,
      image: dummyProduct.thumbnail,
      discountPercentage: dummyProduct.discountPercentage,
      stock: dummyProduct.stock,
    };
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
        // Aplicando el descuento
        const productWithDiscount = {
          ...product,
          finalPrice: this._applyDiscount(product),
        };
        this._processProductData(productWithDiscount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando producto por ID:', err);
        this.loading.set(false);
      },
    });
  }

  private _processProductData(data: DummyProduct) {
    this.dummyProduct.set(data);
    // Sanitización
    this.safeThumbnail.set(this._sanitizer.bypassSecurityTrustResourceUrl(data.thumbnail));

    if (data.images) {
      const images = data.images.map((img) => this._sanitizer.bypassSecurityTrustResourceUrl(img));
      this.safeGallery.set(images);
    }

    this._updateSeo(data);
  }

  private _applyDiscount(product: DummyProduct): number {
    if (product.discountPercentage && product.discountPercentage > 0) {
      const discount = (product.price * product.discountPercentage) / 100;
      const price = product.price - discount;
      return Number(price.toFixed(2));
    }
    return product.price;
  }

  private _updateSeo(p: DummyProduct) {
    this._titleService.setTitle(`${p.title} | ${p.brand}`);
    this._metaService.updateTag({ name: 'description', content: p.description });
    this._metaService.updateTag({ property: 'og:type', content: 'product' });
    this._metaService.updateTag({ property: 'og:price:amount', content: p.price.toString() });
    this._metaService.updateTag({ property: 'og:price:currency', content: 'USD' });
  }
}
