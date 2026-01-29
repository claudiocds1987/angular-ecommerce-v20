import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';
import { ProductFilterData } from '../../shared/models/product-filter-data.model';
import { ProductFilter } from './product-filter/product-filter';


@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [ProductCard, ProductCardSkeleton, IaChat, ProductFilter],
    templateUrl: './products-list.html',
    styleUrl: './products-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsList implements OnInit {
    products = signal<Product[]>([]);
    isLoading = signal(true);
    skip = signal(0);
    limit = 30;
    totalProducts = signal(0);
    showFilter = signal(false);

    // signal para guardar los filtros actuales
    currentFilters = signal<ProductFilterData | null>(null);

    iaChatService = inject(IaChatService);
    private _productsService = inject(ProductService);

    ngOnInit() {
        this._loadProducts();
    }

    handleFilter(filters: ProductFilterData) {
        this.currentFilters.set(filters);
        this.skip.set(0); // Al filtrar, volvemos a la primera página
        this._loadProducts();
    }

    // Función para cargar más productos (paginación)
    loadMore() {
        this.skip.update((current) => current + this.limit);
        this._loadProducts();
    }

    private _loadProducts() {
        this.isLoading.set(true);
        const filters = this.currentFilters();
        const searchTerm = filters?.search || '';

        this._productsService
            .getFilteredProducts(this.limit, this.skip(), searchTerm)
            .subscribe((res) => {
                // 1. Mapeamos y aplicamos descuento
                let processed = res.products.map((product: Product) => ({
                    ...product,
                    finalPrice: this._applyDiscount(product),
                }));

                // 2. Filtros adicionales en el cliente (Precio y Categoría)
                if (filters) {
                    if (filters.category) {
                        processed = processed.filter((p) => p.category === filters.category);
                    }
                    if (filters.minPrice !== null && filters.minPrice !== undefined) {
                        processed = processed.filter((p) => p.price >= filters.minPrice!);
                    }
                    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
                        processed = processed.filter((p) => p.price <= filters.maxPrice!);
                    }

                    // Ordenar dinámicamente según el selector
                    const sortKey = filters.sortBy as keyof Product;
                    processed.sort((a, b) => {
                        if (a[sortKey]! < b[sortKey]!) return -1;
                        if (a[sortKey]! > b[sortKey]!) return 1;
                        return 0;
                    });
                }

                // 3. Actualizamos el signal
                // Si skip es 0, reemplazamos (nueva búsqueda). Si no, concatenamos (ver más).
                if (this.skip() === 0) {
                    this.products.set(processed);
                } else {
                    this.products.update((prev) => [...prev, ...processed]);
                }

                this.totalProducts.set(res.total);
                this.isLoading.set(false);
            });
    }

    private _applyDiscount(product: Product): number {
        if (product.discountPercentage && product.discountPercentage > 0) {
            const discount = (product.price * product.discountPercentage) / 100;
            const price = product.price - discount;
            return Number(price.toFixed(2));
        }
        return product.price;
    }
}
