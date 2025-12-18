import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';
import { ProductCardSkeleton } from "./product-card-skeleton/product-card-skeleton";

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [ProductCard, ProductCardSkeleton],
    templateUrl: './products-list.html',
    styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {
    products = signal<Product[]>([]);
    isLoading = signal(true);
    private _productsService = inject(ProductService);

    ngOnInit() {
        this._getProducts();
    }

    private _getProducts() {
        this._productsService.getProducts().subscribe((products) => {
            this.isLoading.set(false);
            this.products.set(products);
        });
    }
}
