import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { Product } from '@features/products/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '@features/products/services/product-service';
import { ProductCardSkeleton } from './product-card-skeleton/product-card-skeleton';
import { IaChat } from '@features/ai-assistant/components/ia-chat/ia-chat';
import { IaChatService } from '@features/ai-assistant/services/ia-chat-service';
import { CustomerProductFilter } from '@features/products/models/costumer-product-filter.model';
import { ProductFilter } from './product-filter/product-filter';
import { CarouselComponent } from '@shared/components/carousel/carousel.component';
import { ProductStore } from '@features/products/state/product.store';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [ProductCard, ProductCardSkeleton, IaChat, ProductFilter, CarouselComponent, Button],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsList implements OnInit {
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
  private _titleService = inject(Title);
  private _metaService = inject(Meta);

  private _queryState = computed(() => ({
    filters: this.currentFilters(),
    page: this.currentPage(),
  }));

  constructor() {
    this._loadProducts();
    this._loadCarouselProducts();
  }

  ngOnInit(): void {
    this._titleService.setTitle('Catálogo de Productos | E-Commerce');
    this._metaService.updateTag({
      name: 'description',
      content:
        'Explora nuestra amplia variedad de productos de la mejor calidad. Encuentra lo que buscas al mejor precio.',
    });
    this._metaService.updateTag({
      property: 'og:title',
      content: 'Catálogo de Productos | E-Commerce',
    });
    this._metaService.updateTag({
      property: 'og:description',
      content:
        'Explora nuestra amplia variedad de productos de la mejor calidad. Encuentra lo que buscas al mejor precio.',
    });
  }

  private _loadCarouselProducts() {
    this._productsService
      .getProductsPaginated(1, 100)
      .pipe(
        map((res) => {
          const items = res?.items || res || [];
          // Filtrando productos isActive = true
          const activeProducts = items.filter((product: Product) => product.isActive === true);

          console.log('Productos activos:', activeProducts.length);

          const uniqueCategories = new Set<string>();
          const selectedProducts: Product[] = [];

          // Buscar variedad por categoría
          for (const product of activeProducts) {
            if (product.category && !uniqueCategories.has(product.category)) {
              uniqueCategories.add(product.category);
              selectedProducts.push(product);
              if (selectedProducts.length === 8) break;
            }
          }

          // Respaldo (Fallback): Rellenar si faltan productos
          if (selectedProducts.length < 4) {
            for (const product of activeProducts) {
              if (!selectedProducts.some((p) => p.id === product.id)) {
                selectedProducts.push(product);
              }
              if (selectedProducts.length === 8) break;
            }
          }
          return selectedProducts;
        }),
      )
      .subscribe((selectedProducts) => {
        this.carouselProducts.set(selectedProducts);
      });
  }

  private _loadProducts() {
    toObservable(this._queryState)
      .pipe(
        // distinctUntilChanged evita que no haga nada si el valor nuevo es igual al anterior
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      )
      .subscribe(({ page, filters }) => {
        this.productStore.searchProducts({
          filters:
            filters ||
            ({
              search: '',
              minPrice: null,
              maxPrice: null,
              categoryId: '',
              brandId: '',
              sortBy: 'rating',
              order: 'asc',
            } as CustomerProductFilter),
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
    this.currentPage.update((page) => page + 1);
  }
}
