import { Component, input, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styles: [],
})
export class CarouselComponent implements OnInit, OnDestroy {
  products = input.required<Product[]>();
  title = input('¡Aprovechá las ofertas destacadas!');

  currentIndex = signal(0);
  itemsPerView = signal(4);

  Math = Math; // Make Math available in template

  maxIndex = computed(() => {
    return Math.max(0, this.products().length - this.itemsPerView());
  });

  showControls = computed(() => {
    return this.products().length > this.itemsPerView();
  });

  indicators = computed(() => {
    if (this.itemsPerView() <= 0) return [];
    const totalPages = Math.ceil(this.products().length / this.itemsPerView());
    return new Array(totalPages).fill(0);
  });

  @HostListener('window:resize')
  onResize() {
    this.updateItemsPerView();
  }

  private _intervalId: any;
  autoPlay = input(true);
  autoPlayInterval = input(5000);

  ngOnInit() {
    this.updateItemsPerView();
    if (this.autoPlay()) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    if (this.autoPlay()) {
      this._intervalId = setInterval(() => {
        if (this.currentIndex() < this.maxIndex()) {
          this.next();
        } else {
          this.currentIndex.set(0); // Loop back to start
        }
      }, this.autoPlayInterval());
    }
  }

  stopAutoplay() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  updateItemsPerView() {
    const width = window.innerWidth;
    if (width < 640) {
      this.itemsPerView.set(1);
    } else if (width < 1024) {
      this.itemsPerView.set(2);
    } else if (width < 1280) {
      this.itemsPerView.set(3);
    } else {
      this.itemsPerView.set(4);
    }

    // Reset index if out of bounds after resize
    if (this.currentIndex() > this.maxIndex()) {
      this.currentIndex.set(this.maxIndex());
    }
  }

  next() {
    if (this.currentIndex() < this.maxIndex()) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  goToIndex(pageIndex: number) {
    const targetIndex = pageIndex * this.itemsPerView();
    // Ensure we don't go out of bounds
    this.currentIndex.set(Math.min(targetIndex, this.maxIndex()));
  }
}
