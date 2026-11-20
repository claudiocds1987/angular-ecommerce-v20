import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UploadImageComponent } from '@shared/components/upload-image/upload-image';
import { FormFieldError } from '../../../../../../shared/components/form-field-error/form-field-error';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';
import { ProductFormModel } from '@features/products/models/product-form.model';

@Component({
  selector: 'app-basic-info-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    UploadImageComponent,
    FormFieldError,
    SkeletonDirective,
  ],
  templateUrl: './basic-info-tab.html',
  styleUrls: ['./basic-info-tab.scss', '../../../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInfoTab {
  productForm = input.required<FieldTree<ProductFormModel>>();
  isLoading = input<boolean>(false);
}
