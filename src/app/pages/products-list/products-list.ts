import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';
import { CustomerProductFilter } from '../../shared/models/costumer-product-filter.model';
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
  currentFilters = signal<CustomerProductFilter | null>(null);
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
    // Solicita los primeros 100 productos para extraer la muestra del carrusel
    this._productsService.getProductsPaginated(1, 100).subscribe((res) => {
      const uniqueCategories = new Set<string>();
      const selectedProducts: Product[] = [];

      if (res && res.items) {
        // 1. Intento principal: Buscar variedad (un producto por categoría)
        for (const product of res.items) {
          // Usamos 'category' (string) que es lo que viene del ProductDto
          if (product.category && !uniqueCategories.has(product.category)) {
            uniqueCategories.add(product.category);
            selectedProducts.push(product);
            // Se carga un máximo de 8 productos en el carousel
            if (selectedProducts.length === 8) break;
          }
        }
        // 2. Respaldo (Fallback): Si hay pocos tipos de categorías en los primeros 100 productos
        // y no logramos juntar al menos 4 para mostrar el carrusel, rellenamos con lo que haya.
        if (selectedProducts.length < 4) {
          for (const product of res.items) {
            // Si el producto no fue agregado ya, lo metemos para rellenar
            if (!selectedProducts.some((p) => p.id === product.id)) {
              selectedProducts.push(product);
            }
            if (selectedProducts.length === 8) break;
          }
        }
      }
      // Actualiza el signal con los productos encontrados
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
          // Si filters es null o undefined, mandamos un objeto vacío con el tipo correcto
          filters: filters ?? ({} as CustomerProductFilter),
          page: page,
          size: this.pageSize,
        });
      });
  }

  handleFilter(filters: CustomerProductFilter) {
    this.currentFilters.set(filters);
    this.currentPage.set(1);

    this.productStore.searchProducts({
      filters: filters,
      page: 1,
      size: 30,
    });
  }

  loadMore() {
    this.currentPage.update((p) => p + 1);
  }
}
