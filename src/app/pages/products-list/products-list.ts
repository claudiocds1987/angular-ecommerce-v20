import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { ProductCard } from './product-card/product-card';
import { ProductService } from '../../shared/services/product-service';

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [ProductCard],
    templateUrl: './products-list.html',
    styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {
    products = signal<Product[]>([]);

    private _productsService = inject(ProductService);

    ngOnInit() {
        this._getProducts();
    }

    private _getProducts() {
        this._productsService.getProducts().subscribe((products) => {
            console.log('Productos obtenidos del servicio:', products);
            this.products.set(products);
        });
    }
}
