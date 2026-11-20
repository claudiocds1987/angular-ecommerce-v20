import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldError } from '../../../../../../shared/components/form-field-error/form-field-error';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';
import { ProductCategory } from '@features/categories/models/product-category.model';
import { ProductBrand } from '@features/brands/models/product-brand.model';
import { ProductFormModel } from '../../product-form-admin';

@Component({
  selector: 'app-pricing-classification-tab',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    FormFieldError,
    SkeletonDirective,
  ],
  templateUrl: './pricing-classification-tab.html',
  styleUrls: ['./pricing-classification-tab.scss', '../../../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingClassificationTab {
  productForm = input.required<FieldTree<ProductFormModel>>();
  isLoading = input<boolean>(false);
  categories = input.required<ProductCategory[]>();
  brands = input.required<ProductBrand[]>();
  finalPrice = input.required<number>();
  onNumberKeydown = input.required<(event: KeyboardEvent) => void>();
}
