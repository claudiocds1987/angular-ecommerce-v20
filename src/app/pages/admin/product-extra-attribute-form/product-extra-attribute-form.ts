import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductExtraAttributeService } from '../../../shared/services/product-extra-attribute-service';
import { ProductExtraAttribute } from '../../../shared/models/product-extra-attribute.model';
import { SpinnerService } from '../../../shared/services/spinner-service';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CategoryStore } from '../state/category.store';
import { ProductCategory } from '../../../shared/models/product-category.model';
import { duplicateNameValidator } from '../../../shared/validators/custom-form-validators';

@Component({
  selector: 'app-product-extra-attribute-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-extra-attribute-form.html',
  styleUrl: './product-extra-attribute-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductExtraAttributeForm implements OnInit {
  private _fb = inject(FormBuilder);
  private _spinnerService = inject(SpinnerService);
  private attributeService = inject(ProductExtraAttributeService);
  private _categoryStore = inject(CategoryStore);

  categoriesSig = this._categoryStore.items;

  // Formulario principal
  form = this._fb.group({
    categoryId: [null, Validators.required],
    attributes: this._fb.array([], duplicateNameValidator()),
  });

  // Getter para el FormArray extraAttributes
  get extraAttributesArray() {
    return this.form.get('attributes') as FormArray;
  }

  ngOnInit() {
    if (this._categoryStore.items().length === 0) {
      this._categoryStore.loadAll();
    }
  }

  // Escuchar cuando cambia la categoría
  onCategoryChange(categoryId: number) {
    this.attributeService.getExtraAttributesByCategory(categoryId).subscribe({
      next: (defs) => this.buildForm(defs),
      error: () => this.extraAttributesArray.clear(),
    });
  }

  onSave() {
    if (this.form.invalid) return;

    const categoryId = this.form.get('categoryId')?.value;

    if (categoryId) {
      const attributesToSave = this.extraAttributesArray.getRawValue() as ProductExtraAttribute[];

      this.attributeService.saveExtraAttributes(categoryId, attributesToSave).subscribe({
        next: () => {
          alert('Guardado correctamente');
          this.onCategoryChange(categoryId); // Recargamos para limpiar estados
        },
        error: () => alert('Error al guardar'),
      });
    }
  }

  private buildForm(defs: ProductExtraAttribute[]) {
    this.extraAttributesArray.clear();
    defs.forEach((def) => {
      this.extraAttributesArray.push(this.createAttributeGroup(def));
    });
  }

  // Modificamos el método createAttributeGroup
  private createAttributeGroup(def?: ProductExtraAttribute): FormGroup {
    return this._fb.group({
      id: [def?.id || 0],
      name: [def?.name || '', Validators.required],
      label: [def?.label || '', Validators.required],
      dataType: [def?.dataType || 'text', Validators.required],
      categoryId: [this.form.get('categoryId')?.value],
      // Inicializamos todos los campos de validación posibles
      validations: this._fb.group({
        required: [def?.validations?.required || false],
        minLength: [def?.validations?.minLength || null],
        maxLength: [def?.validations?.maxLength || null],
        pattern: [def?.validations?.pattern || null],
        min: [def?.validations?.min || null],
        max: [def?.validations?.max || null],
      }),
    });
  }

  addEmptyAttribute() {
    this.extraAttributesArray.push(this.createAttributeGroup());
  }

  // CRÍTICO: Solo borrar si es nuevo (id === 0)
  removeAttribute(index: number) {
    const control = this.extraAttributesArray.at(index);
    if (control.get('id')?.value === 0) {
      this.extraAttributesArray.removeAt(index);
    } else {
      alert('No puedes borrar un atributo existente porque afectaría a los productos ya creados.');
    }
  }
}
