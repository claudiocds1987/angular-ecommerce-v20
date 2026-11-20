import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldError } from '../../../../../../shared/components/form-field-error/form-field-error';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';
import { ProductFormModel } from '../../product-form-admin';

@Component({
  selector: 'app-inventory-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormFieldError,
    SkeletonDirective,
  ],
  templateUrl: './inventory-tab.html',
  styleUrls: ['./inventory-tab.scss', '../../../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTab {
  productForm = input.required<FieldTree<ProductFormModel>>();
  isLoading = input<boolean>(false);
  onNumberKeydown = input.required<(event: KeyboardEvent) => void>();
}
