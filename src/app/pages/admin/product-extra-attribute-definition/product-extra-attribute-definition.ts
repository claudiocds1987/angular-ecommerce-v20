import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
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
import { ProductExtraAttributeService } from '@features/products/services/product-extra-attribute-service';
import { ProductExtraAttribute } from '@features/products/models/product-extra-attribute.model';
import { SpinnerService } from '@shared/services/spinner-service';
import { CommonModule } from '@angular/common';
import { CategoryStore } from '@features/products/state/category.store';

import { duplicateNameValidator } from '../../../shared/validators/custom-form-validators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormFieldError } from '../../../shared/components/form-field-error/form-field-error';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Router } from '@angular/router';
import { ToastService } from '@shared/services/toast-service';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '@core/guards/unsaved-changes.guard';

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
    FormFieldError,
    PrimaryButton,
    Breadcrumb,
  ],
  templateUrl: './product-extra-attribute-definition.html',
  styleUrl: './product-extra-attribute-definition.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductExtraAttributeDefinition implements OnInit, CanComponentDeactivate {
  breadcrumbItems = signal<BreadcrumbItem[]>([
    { label: 'Admin Dashboard', url: '/admin' },
    { label: 'Atributos extra por categoría' },
  ]);
  private _fb = inject(FormBuilder);
  private _spinnerService = inject(SpinnerService);
  private attributeService = inject(ProductExtraAttributeService);
  private _categoryStore = inject(CategoryStore);
  private _confirmDialogService = inject(ConfirmDialogService);
  private _router = inject(Router);
  private _toast = inject(ToastService);

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

  canDeactivate(): Observable<boolean> | boolean {
    // Si no ha cambiado nada o el carrito esta vacío, dejamos salir sin preguntar
    if (!this.extraAttributesArray.dirty) return true;

    // Si hay cambios, lanzamos tu servicio (que ya devuelve Observable<boolean>)
    return this._confirmDialogService.open({
      title: 'Tiene cambios sin guardar',
      message: '¿Deseas salir?',
      confirmLabel: 'Salir',
      cancelLabel: 'Continuar',
      confirmColor: 'warn',
    });
  }

  isReadyToSave() {
    return this.form.valid && this.extraAttributesArray.valid && this.extraAttributesArray.dirty;
  }

  /** Solo los atributos importan: elegir categoría o rellenar el array desde el API no debe bloquear la salida. */
  hasUnsavedChanges(): boolean {
    return this.extraAttributesArray.dirty;
  }

  // Escucha cuando se cierra la ventana o se hace un refresh en la pagina, muestra el alert del browser es independiente al mat dialog
  // Ejemplo: El usuario escribe en el formulario y si por accidente cierra o refresca la ventana, muestra el alert propio del navegador
  // avisandole que tiene cambios pendientes, si realmente quiere salir.
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  confirmSave(): void {
    if (!this.isReadyToSave()) return;
    this._confirmDialogService
      .open({
        title: 'Guardar configuración',
        message: '¿Deseas guardar los atributos extra de esta categoría en el servidor?',
        confirmLabel: 'Guardar',
        cancelLabel: 'Cancelar',
        confirmColor: 'primary',
      })
      .subscribe((confirmed) => {
        if (confirmed) this.onSave();
      });
  }

  confirmCancel(): void {
    if (!this.hasUnsavedChanges()) {
      void this._router.navigate(['/admin']);
      return;
    }
    this._confirmDialogService
      .open({
        title: 'Salir sin guardar',
        message:
          'Hay cambios sin guardar. Si sales ahora, se perderán. ¿Deseas salir del panel de configuración?',
        confirmLabel: 'Salir sin guardar',
        cancelLabel: 'Seguir editando',
        confirmColor: 'warn',
      })
      .subscribe((confirmed) => {
        if (confirmed) void this._router.navigate(['/admin']);
      });
  }

  // Escuchar cuando cambia la categoría
  onCategoryChange(categoryId: number) {
    this.attributeService.getExtraAttributesByCategory(categoryId).subscribe({
      next: (defs) => this.buildForm(defs),
      error: () => this.extraAttributesArray.clear(),
    });
  }

  private onSave(): void {
    if (this.form.invalid) return;
    this._spinnerService.show();
    const categoryId = this.form.get('categoryId')?.value;

    if (categoryId) {
      const attributesToSave = this.extraAttributesArray.getRawValue() as ProductExtraAttribute[];
      this.attributeService.saveExtraAttributes(categoryId, attributesToSave).subscribe({
        next: () => {
          this._toast.show('Guardado correctamente', 'success');
          this._spinnerService.hide();
          this.onCategoryChange(categoryId);
        },
        error: () => {
          this._toast.show('Error al guardar', 'danger');
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
    // clear/push pueden dejar el array en dirty sin edición del usuario; alinear con datos del servidor.
    this.extraAttributesArray.markAsPristine();
  }

  private createAttributeGroup(def?: ProductExtraAttribute): FormGroup {
    // `validations.required` del backend: obligatoriedad del atributo en catálogo.
    // Fila nueva sin `def`: exigimos nombre y etiqueta hasta que el usuario defina el atributo.
    const attrRequired = !def || !!def.validations?.required;
    const nameValidators = attrRequired ? [Validators.required] : [];
    const labelValidators = attrRequired ? [Validators.required] : [];

    return this._fb.group({
      id: [def?.id || 0],
      name: [def?.name || '', nameValidators],
      label: [def?.label || '', labelValidators],
      dataType: [def?.dataType || 'text', Validators.required],
      categoryId: [this.form.get('categoryId')?.value],
      validations: this._fb.group({
        required: [def?.validations?.required || false],
        minLength: [def?.validations?.minLength || null, [Validators.min(0)]],
        maxLength: [def?.validations?.maxLength || null, [Validators.min(0)]],
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
