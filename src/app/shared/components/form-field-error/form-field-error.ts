/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, input, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, merge, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [],
  templateUrl: './form-field-error.html',
  styleUrl: './form-field-error.scss',
})
export class FormFieldError {
  control = input.required<AbstractControl | null>();
  /** Vuelve a suscribirse cuando cambia el control; value + status cubren errores con mismo status. */
  private readonly controlUpdates = toSignal(
    toObservable(this.control).pipe(
      switchMap((ctrl) => {
        if (!ctrl) return of(0);
        return merge(ctrl.statusChanges, ctrl.valueChanges).pipe(
          startWith(null),
          map(() => Date.now()),
        );
      }),
    ),
    { initialValue: 0 },
  );

  private readonly errorMap: Record<string, (args: any) => string> = {
    required: () => 'Este campo es obligatorio.',
    duplicated: () => 'Este nombre ya existe.',
    email: () => 'El correo electrónico no tiene un formato válido.',
    minlength: (err: any) => `Mínimo ${err.requiredLength} caracteres.`,
    maxlength: (err: any) => `Máximo ${err.requiredLength} caracteres.`,
    min: (err: any) => `El valor debe ser mayor o igual a ${err.min}.`,
    max: (err: any) => `El valor debe ser menor o igual a ${err.max}.`,
    pattern: () => 'El formato introducido no es válido.',
  };

  errorMessage = computed(() => {
    this.controlUpdates();
    const ctrl = this.control();

    if (ctrl && ctrl.invalid) {
      const errors = ctrl.errors;
      if (!errors) return null;

      const firstKey = Object.keys(errors)[0];
      const getMessage = this.errorMap[firstKey];
      return getMessage ? getMessage(errors[firstKey]) : 'Campo no válido.';
    }

    return null;
  });
}
