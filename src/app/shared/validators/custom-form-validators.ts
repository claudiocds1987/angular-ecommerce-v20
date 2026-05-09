import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

/**
 * Validador para detectar nombres duplicados dentro de un FormArray.
 * Útil para la configuración de atributos extra por categoría.
 */
export function duplicateNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    if (!formArray) return null;

    // Extraemos los valores limpios y en minúsculas
    const names = formArray.controls.map((c) =>
      c.get('name')?.value?.toString().toLowerCase().trim(),
    );

    // Identificamos cuáles nombres están repetidos
    const duplicates = names.filter((name, index) => name && names.indexOf(name) !== index);

    formArray.controls.forEach((group) => {
      const nameControl = group.get('name');
      if (!nameControl) return;

      const value = nameControl.value?.toString().toLowerCase().trim();
      const isDuplicate = duplicates.includes(value);

      if (isDuplicate) {
        // Seteamos el error manteniendo los que ya existan (como required)
        nameControl.setErrors({ ...nameControl.errors, duplicated: true });
      } else if (nameControl.hasError('duplicated')) {
        const remainingErrors = { ...nameControl.errors };
        delete remainingErrors['duplicated']; // Eliminamos la propiedad directamente

        const hasRemaining = Object.keys(remainingErrors).length > 0;
        nameControl.setErrors(hasRemaining ? remainingErrors : null);
      }
    });

    return null;
  };
}
