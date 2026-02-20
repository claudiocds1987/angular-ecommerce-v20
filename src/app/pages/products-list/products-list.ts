import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';
import { ProductFilterData } from '../../shared/models/product-filter-data.model';
import { ProductFilter } from './product-filter/product-filter';
import { CarouselComponent } from '../../shared/components/carousel/carousel.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [ProductCard, ProductCardSkeleton, IaChat, ProductFilter, CarouselComponent],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsList {
  products = signal<Product[]>([]);
  isLoading = signal(true);
  skip = signal(0); // Número de productos a saltar (paginación offset) para cargar los siguientes ej: Salta los primeros 30 y dame los siguientes 30". (Te da del 31 al 60).
  limit = 30; // Número de productos por página
  totalProducts = signal(0);
  showFilter = signal(false);

  // signal para guardar los filtros actuales
  currentFilters = signal<ProductFilterData | null>(null);

  carouselProducts = signal<Product[]>([]);

  iaChatService = inject(IaChatService);
  private _productsService = inject(ProductService);

  // Combinamos el estado para reaccionar a cambios en filtros o paginación
  private _queryState = computed(() => ({
    filters: this.currentFilters(),
    skip: this.skip(),
  }));

  constructor() {
    this._listenToQueryChanges();
    this._loadCarouselProducts();
  }

  private _loadCarouselProducts() {
    this._productsService.getDummys(100, 0).subscribe((res) => {
      const uniqueCategories = new Set<string>();
      const selectedProducts: Product[] = [];

      for (const product of res.products) {
        if (product.category && !uniqueCategories.has(product.category)) {
          uniqueCategories.add(product.category);
          selectedProducts.push({
            ...product,
            finalPrice: this._applyDiscount(product),
          });
          if (selectedProducts.length === 8) break;
        }
      }
      this.carouselProducts.set(selectedProducts);
    });
  }

  private _listenToQueryChanges() {
    // Reacción automática ante cambios en filtros o skip
    toObservable(this._queryState)
      .pipe(
        switchMap(({ filters, skip }) => {
          this.isLoading.set(true);
          const searchTerm = filters?.search || '';
          const category = filters?.category || '';

          return this._productsService
            .getFilteredProducts(this.limit, skip, searchTerm, category)
            .pipe(
              map((res) => {
                // 1. Mapeamos y aplicamos descuento
                let processed = res.products.map((product: Product) => ({
                  ...product,
                  finalPrice: this._applyDiscount(product),
                }));

                // 2. Filtros adicionales en el cliente
                // NOTA: DummyJSON no permite filtrar por categoría y búsqueda simultáneamente,
                // por lo que aplicamos el filtrado por búsqueda, precio y ordenamiento aca.
                if (filters) {
                  // Filtrar por término de búsqueda (insensible a mayúsculas/minúsculas)
                  if (filters.search) {
                    const term = filters.search.toLowerCase();
                    processed = processed.filter((p) => p.title.toLowerCase().includes(term));
                  }

                  // Filtrar por rango de precio
                  if (filters.minPrice !== null && filters.minPrice !== undefined) {
                    processed = processed.filter((p) => p.price >= filters.minPrice!);
                  }
                  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
                    processed = processed.filter((p) => p.price <= filters.maxPrice!);
                  }

                  // Ordenar dinámicamente según el selector

                  // Si el usuario elige ordenar por "precio", usamos el precio final (con descuento)
                  // que es el que el usuario ve en la interfaz.
                  const effectiveSortKey: keyof Product =
                    filters.sortBy === 'price' ? 'finalPrice' : (filters.sortBy as keyof Product);

                  processed.sort((a, b) => {
                    const valA = a[effectiveSortKey];
                    const valB = b[effectiveSortKey];

                    if (valA! < valB!) return filters.order === 'desc' ? 1 : -1;
                    if (valA! > valB!) return filters.order === 'desc' ? -1 : 1;
                    return 0;
                  });
                }

                return { processed, total: res.total, skip };
              }),
            );
        }),
      )
      .subscribe(({ processed, total, skip }) => {
        // 3. Actualizando el signal
        if (skip === 0) {
          this.products.set(processed);
        } else {
          this.products.update((prev) => [...prev, ...processed]);
        }

        this.totalProducts.set(total);
        this.isLoading.set(false);
      });
  }

  handleFilter(filters: ProductFilterData) {
    // Al setear currentFilters, el computed _queryState cambia y dispara el switchMap
    this.currentFilters.set(filters);
    this.skip.set(0);
  }

  // Función para cargar más productos (paginación)
  loadMore() {
    this.skip.update((current) => current + this.limit);
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
