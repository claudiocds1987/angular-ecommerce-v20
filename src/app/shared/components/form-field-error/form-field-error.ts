import { Component, ChangeDetectionStrategy, input, computed, effect, signal } from '@angular/core';

import type { AbstractControl } from '@angular/forms';
import { FieldState } from '@angular/forms/signals';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
// IMPORTA FieldState desde la librería de signals form que uses

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  templateUrl: './form-field-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError {
  // Tipado correcto: acepta AbstractControl o FieldState o null
  control = input.required<AbstractControl | FieldState<any, any> | null>();

  // Señal que actualizamos cuando el AbstractControl emite cambios
  private readonly abstractTick = signal<number>(0);

  // Mantener referencia a la suscripción para limpiar
  private _abstractSub: Subscription | null = null;

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

  // Effect que observa cambios en el control() y crea/limpia suscripciones imperativas
  private readonly manageAbstractControlSub = effect((onCleanup) => {
    // Cada vez que cambie el control, ejecutamos esta función
    const ctrl = this.control();

    // limpiar suscripción previa si existía
    if (this._abstractSub) {
      this._abstractSub.unsubscribe();
      this._abstractSub = null;
    }

    // Si no hay control o no es AbstractControl, no hacemos nada
    if (!ctrl || (ctrl as AbstractControl).statusChanges === undefined) {
      return;
    }

    // Es un AbstractControl: suscribimos a statusChanges y valueChanges
    const ac = ctrl as AbstractControl;
    const sub = ac.statusChanges?.subscribe(() => this.abstractTick.set(Date.now()));
    // opcional: también suscribir a valueChanges si quieres re-evaluar por cambios de valor
    const sub2 = ac.valueChanges?.subscribe(() => this.abstractTick.set(Date.now()));

    // guardamos la suscripción combinada para limpiar luego
    this._abstractSub = {
      unsubscribe: () => {
        sub?.unsubscribe();
        sub2?.unsubscribe();
      },
    } as unknown as Subscription;

    // onCleanup se ejecuta cuando el effect se re-evalúa o el componente se destruye
    onCleanup(() => {
      this._abstractSub?.unsubscribe();
      this._abstractSub = null;
    });
  });

  // Computed que devuelve el mensaje de error; lee abstractTick() para re-evaluarse cuando AbstractControl emite
  errorMessage = computed(() => {
    // Forzamos lectura de abstractTick para que la computed se re-evalúe cuando el AbstractControl emita
    this.abstractTick();

    const ctrl = this.control();
    if (!ctrl) return null;

    // --- FieldState (signals form) ---
    if (typeof (ctrl as any).invalid === 'function') {
      if (!(ctrl as any).invalid()) return null;
      const errors =
        typeof (ctrl as any).errors === 'function' ? (ctrl as any).errors() : (ctrl as any).errors;
      if (!errors || !errors.length) return null;
      const first = errors[0];
      return first?.message ?? 'Campo no válido.';
    }

    // --- AbstractControl (Angular Reactive Forms) ---
    if ((ctrl as AbstractControl).invalid) {
      const errors = (ctrl as AbstractControl).errors;
      if (!errors) return null;
      const firstKey = Object.keys(errors)[0];
      const getMessage = this.errorMap[firstKey];
      return getMessage ? getMessage(errors[firstKey]) : 'Campo no válido.';
    }

    return null;
  });
}
