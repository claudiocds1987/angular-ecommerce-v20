import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [ProductCard, ProductCardSkeleton, IaChat],
    templateUrl: './products-list.html',
    styleUrl: './products-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsList implements OnInit {
    products = signal<Product[]>([]);
    isLoading = signal(true);
    // Agregamos estados para la paginación
    skip = signal(0);
    limit = 30;
    totalProducts = signal(0);

    iaChatService = inject(IaChatService);

    private _productsService = inject(ProductService);

    ngOnInit() {
        this._loadProducts();
    }

    // Función para cargar más productos
    loadMore() {
        this.skip.update((current) => current + this.limit);
        this._loadProducts();
    }

    private _loadProducts() {
        this.isLoading.set(true);
        this._productsService.getDummys(this.limit, this.skip()).subscribe((res) => {
            
            // Mapeamos los productos para calcular el precio final
            const processedProducts = res.products.map((product: Product) => {
                return {
                    ...product,
                    finalPrice: this._applyDiscount(product)
                };
            });

            // Actualizamos el signal con los productos procesados
            this.products.update(prev => [...prev, ...processedProducts]);
            this.totalProducts.set(res.total);
            this.isLoading.set(false);
        });
    }

    // Función que aplica la lógica de descuento
    private _applyDiscount(product: Product): number {
        if (product.discountPercentage && product.discountPercentage > 0) {
            const discount = (product.price * product.discountPercentage) / 100;
            const price = product.price - discount;
            return Number(price.toFixed(2));
        }
        return product.price;
    }
}
