import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-product-rating',
  styleUrl: './product-rating.scss',
  templateUrl: './product-rating.html',
})
export class ProductRating {
  readonly rating = input<number | undefined>();

  readonly roundedRating = computed(() => Math.round((this.rating() ?? 0) * 2) / 2);

  getStarType(star: number): 'full' | 'half' | 'empty' {
    const rating = this.roundedRating();

    if (star <= Math.floor(rating)) {
      return 'full';
    }

    if (star - 0.5 === rating) {
      return 'half';
    }

    return 'empty';
  }
}
