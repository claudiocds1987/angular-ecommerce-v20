import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';
import { ProductFormModel } from '../../product-form-admin';

@Component({
  selector: 'app-shipping-warranty-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    SkeletonDirective,
  ],
  templateUrl: './shipping-warranty-tab.html',
  styleUrls: ['./shipping-warranty-tab.scss', '../../../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingWarrantyTab {
  productForm = input.required<FieldTree<ProductFormModel>>();
  isLoading = input<boolean>(false);
}
