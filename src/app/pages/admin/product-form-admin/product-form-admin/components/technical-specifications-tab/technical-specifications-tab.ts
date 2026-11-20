import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormFieldError } from '../../../../../../shared/components/form-field-error/form-field-error';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';
import { ProductFormModel } from '../../product-form-admin';

@Component({
  selector: 'app-technical-specifications-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    FormFieldError,
    SkeletonDirective,
  ],
  templateUrl: './technical-specifications-tab.html',
  styleUrls: [
    './technical-specifications-tab.scss',
    '../../../../../../shared/styles/skeleton.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalSpecificationsTab {
  productForm = input.required<FieldTree<ProductFormModel>>();
  isLoading = input<boolean>(false);

  trackByAttributeName(index: number, extraAttributeName: string | undefined): string {
    return extraAttributeName || index.toString();
  }
}
