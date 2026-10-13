import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  input,
  signal,
  effect,
  computed,
} from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FieldState } from '@angular/forms/signals';
import { Subscription } from 'rxjs';

type FieldStateType = FieldState<string, string>;
type PossibleControl = AbstractControl | FieldStateType | null;

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  templateUrl: './form-field-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError implements OnDestroy {
  // acepta AbstractControl (Reactive Forms) o FieldState (Signals Form)
  control = input.required<PossibleControl>();

  private readonly abstractTick = signal<number>(0);
  private _abstractSub: Subscription | null = null;

  private readonly errorMap: Record<string, (args: unknown) => string> = {
    required: () => 'Este campo es obligatorio.',
    duplicated: () => 'Este nombre ya existe.',
    email: () => 'El correo electrónico no tiene un formato válido.',
    minlength: (err: unknown) =>
      `Mínimo ${(err as { requiredLength?: number }).requiredLength} caracteres.`,
    maxlength: (err: unknown) =>
      `Máximo ${(err as { requiredLength?: number }).requiredLength} caracteres.`,
    min: (err: unknown) => `El valor debe ser mayor o igual a ${(err as { min?: number }).min}.`,
    max: (err: unknown) => `El valor debe ser menor o igual a ${(err as { max?: number }).max}.`,
    pattern: () => 'El formato introducido no es válido.',
  };

  constructor() {
    effect(() => {
      const ctrl = this.control();

      // limpiar suscripción previa
      if (this._abstractSub) {
        this._abstractSub.unsubscribe();
        this._abstractSub = null;
      }

      // si no es AbstractControl, no suscribimos
      if (!ctrl || (ctrl as AbstractControl).statusChanges === undefined) {
        return;
      }

      const ac = ctrl as AbstractControl;
      const sub = new Subscription();

      if (ac.statusChanges) {
        sub.add(ac.statusChanges.subscribe(() => this.abstractTick.set(Date.now())));
      }
      if (ac.valueChanges) {
        sub.add(ac.valueChanges.subscribe(() => this.abstractTick.set(Date.now())));
      }

      this._abstractSub = sub;
    });
  }

  errorMessage = computed<string | null>(() => {
    // forzamos re-evaluación cuando AbstractControl emite
    this.abstractTick();

    const ctrl = this.control();
    if (!ctrl) return null;

    // --- FieldState (signals form) ---
    if (typeof (ctrl as FieldStateType).invalid === 'function') {
      const fs = ctrl as FieldStateType;
      const invalid = (fs as unknown as { invalid: () => boolean }).invalid();
      if (!invalid) return null;

      const errorsRaw = (fs as unknown as { errors?: () => unknown[] }).errors?.();
      if (!Array.isArray(errorsRaw) || errorsRaw.length === 0) return null;

      const first = errorsRaw[0] as { message?: string } | unknown;
      if (first && typeof (first as { message?: unknown }).message === 'string') {
        return (first as { message: string }).message;
      }

      return 'Campo no válido.';
    }

    // --- AbstractControl (Reactive Forms) ---
    const ac = ctrl as AbstractControl;
    if (ac.invalid) {
      const errors: ValidationErrors | null = ac.errors ?? null;
      if (!errors) return null;
      const firstKey = Object.keys(errors)[0];
      const mapper = this.errorMap[firstKey];
      return mapper ? mapper(errors[firstKey]) : 'Campo no válido.';
    }

    return null;
  });

  ngOnDestroy(): void {
    this._abstractSub?.unsubscribe();
    this._abstractSub = null;
  }
}
