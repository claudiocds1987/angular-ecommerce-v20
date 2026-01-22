import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../shared/services/product-service';
import { DummyProduct } from '../../shared/models/dummy-response.model';
import { DomSanitizer, SafeResourceUrl, Meta, Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private _route = inject(ActivatedRoute);
  private _productService = inject(ProductService);
  private _titleService = inject(Title);
  private _metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  // Signal para el producto
  dummyProduct = signal<DummyProduct | undefined>(undefined);
  
  // Signals para las imágenes seguras
  safeThumbnail = signal<SafeResourceUrl>('');
  safeGallery = signal<SafeResourceUrl[]>([]);

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    
    if (id) {
      const productId = parseInt(id, 10);
      this._productService.getProductById(productId).subscribe({
        next: (data) => {
          // 1. Guardar el producto
          this.dummyProduct.set(data);

          // 2. Sanitizar la imagen principal inmediatamente
          this.safeThumbnail.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(data.thumbnail)
          );

          // 3. Sanitizar la galería
          if (data.images) {
            const images = data.images.map(img => 
              this.sanitizer.bypassSecurityTrustResourceUrl(img)
            );
            this.safeGallery.set(images);
          }

          this.updateSeo(data);
        },
        error: (err) => console.error("Error cargando producto", err)
      });
    }
  }

  updateSeo(p: DummyProduct) {
    this._titleService.setTitle(`${p.title} | ${p.brand}`);
    this._metaService.updateTag({ name: 'description', content: p.description });
  }
}