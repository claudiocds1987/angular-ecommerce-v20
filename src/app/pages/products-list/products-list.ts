import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from "./product-card-skeleton/product-card-skeleton";
import { IaChat } from '../../shared/components/ia-chat/ia-chat';
import { IaChatService } from '../../shared/services/ia-chat-service';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [ProductCard, ProductCardSkeleton, IaChat],
    templateUrl: './products-list.html',
    styleUrl: './products-list.scss',
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

    private _loadProducts() {
        this.isLoading.set(true);
        this._productsService.getDummys(this.limit, this.skip()).subscribe((res) => {
            console.log(res);
            this.products.update(prev => [...prev, ...res.products]);  // para concatenar los productos nuevos a los anteriores
            this.totalProducts.set(res.total);
            this.isLoading.set(false);
        });
    }

    loadMore() {
        // Incrementamos el skip y cargamos más
        this.skip.update(current => current + this.limit);
        this._loadProducts();
    }
}
