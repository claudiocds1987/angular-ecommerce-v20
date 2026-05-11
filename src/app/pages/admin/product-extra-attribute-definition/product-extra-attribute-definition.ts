import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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

import { duplicateNameValidator } from '../../../shared/validators/custom-form-validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-product-extra-attribute-definition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './product-extra-attribute-definition.html',
  styleUrl: './product-extra-attribute-definition.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductExtraAttributeDefinition implements OnInit {
  private _fb = inject(FormBuilder);
  private _spinnerService = inject(SpinnerService);
  private attributeService = inject(ProductExtraAttributeService);
  private _categoryStore = inject(CategoryStore);

  categoriesSig = this._categoryStore.items;
  extraAttributesSig = signal<FormGroup[]>([]);

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
    this._spinnerService.show();
    const categoryId = this.form.get('categoryId')?.value;

    if (categoryId) {
      const attributesToSave = this.extraAttributesArray.getRawValue() as ProductExtraAttribute[];
      this.attributeService.saveExtraAttributes(categoryId, attributesToSave).subscribe({
        next: () => {
          alert('Guardado correctamente');
          this._spinnerService.hide();
          this.onCategoryChange(categoryId); // Recargamos para limpiar estados
        },
        error: () => {
          alert('Error al guardar');
          this._spinnerService.hide();
        },
      });
    }
  }

  private refreshAttributesSig() {
    this.extraAttributesSig.set([...(this.extraAttributesArray.controls as FormGroup[])]);
  }

  private buildForm(defs: ProductExtraAttribute[]) {
    // 1. Limpiamos el FormArray físico
    this.extraAttributesArray.clear();
    // 2. Creamos las NUEVAS instancias de FormGroup
    const newGroups = defs.map((def) => this.createAttributeGroup(def));
    // 3. Las agregamos al FormArray para que el formulario sea válido
    newGroups.forEach((g) => this.extraAttributesArray.push(g));
    // 4. Seteamos el Signal con un NUEVO array
    // para romper la referencia anterior y forzar a OnPush a repintar.
    this.extraAttributesSig.set([...(this.extraAttributesArray.controls as FormGroup[])]);
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
    this.refreshAttributesSig(); // Notifica el cambio
  }

  // CRÍTICO: Solo borrar si es nuevo (id === 0)
  removeAttribute(index: number) {
    const control = this.extraAttributesArray.at(index);
    if (control.get('id')?.value === 0) {
      this.extraAttributesArray.removeAt(index);
      this.refreshAttributesSig(); // Notifica el cambio
    } else {
      alert('No puedes borrar un atributo existente porque afectaría a los productos ya creados.');
    }
  }
}
