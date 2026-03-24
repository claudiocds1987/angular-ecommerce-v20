import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';
import { ProductFilterData } from '../../shared/models/product-filter-data.model';
import { ProductFilter } from './product-filter/product-filter';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { ProductStore } from '../admin/state/product.store';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [ProductCard, ProductCardSkeleton, IaChat, ProductFilter, CarouselComponent],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsList {
  isLoading = computed(() => this.productStore.loading());
  totalProducts = computed(() => this.productStore.totalItems());
  pageSize = 30; // Cantidad de productos por página

  currentPage = signal(1); // Empezamos en la página 1
  showFilter = signal(false);
  currentFilters = signal<ProductFilterData | null>(null);
  carouselProducts = signal<Product[]>([]);

  readonly productStore = inject(ProductStore);
  iaChatService = inject(IaChatService);
  private _productsService = inject(ProductService);

  private _queryState = computed(() => ({
    filters: this.currentFilters(),
    page: this.currentPage(),
  }));

  constructor() {
    this._syncProductsWithFilters();
    this._loadCarouselProducts();
  }

  private _loadCarouselProducts() {
    // Obtiene una muestra amplia, trae los productos del 1 al 100 (1, 100) para filtrar y mostrar en el Carousel
    // hasta 8 productos, asegurando que cada uno pertenezca a una categoría distinta.
    this._productsService.getProductsPaginated(1, 100).subscribe((res) => {
      const uniqueCategories = new Set<number>();
      const selectedProducts: Product[] = [];

      if (res.items) {
        for (const product of res.items) {
          if (product.categoryId && !uniqueCategories.has(product.categoryId)) {
            uniqueCategories.add(product.categoryId);
            selectedProducts.push(product);
            // Límite visual del Carousel, con 8 productos es suficiente para mostrar variedad sin abrumar al usuario.
            if (selectedProducts.length === 8) break;
          }
        }
      }
      this.carouselProducts.set(selectedProducts);
    });
  }

  private _syncProductsWithFilters() {
    toObservable(this._queryState)
      .pipe(
        // distinctUntilChanged evita que no haga nada si el valor nuevo es igual al anterior
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe(({ filters, page }) => {
        this.productStore.searchProducts({
          query: filters?.search || '',
          page: page,
          size: this.pageSize,
        });
      });
  }

  handleFilter(filters: ProductFilterData) {
    this.currentFilters.set(filters);
    this.currentPage.set(1); // Reset a la primera página al filtrar
    this.productStore.updateQuery(filters.search || '');
  }

  loadMore() {
    this.currentPage.update((p) => p + 1);
  }
}
