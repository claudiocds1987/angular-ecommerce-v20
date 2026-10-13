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

type FieldStateType = FieldState<string, string>; // ajusta genéricos si tu FieldState usa otros tipos
type PossibleControl = AbstractControl | FieldStateType | null;

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  templateUrl: './form-field-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldError implements OnDestroy {
  // Input que acepta un AbstractControl (Reactive Forms) o un FieldState (Signals Form)
  control = input.required<PossibleControl>();

  // Señal que usamos para forzar re-evaluación cuando el control emite cambios
  // Nombre terminado en "Sig" como pediste: representa un "signal" que actúa como trigger.
  private readonly _validationSig = signal<number>(0);

  // Suscripción que agrupa las suscripciones a statusChanges/valueChanges del AbstractControl
  private _controlSubscription: Subscription | null = null;

  // Mapa de claves de error a funciones que devuelven el mensaje legible
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
    // Registramos un effect que observa this.control() y crea/renueva la suscripción al AbstractControl.
    effect(() => {
      // Leemos el control actual (puede ser AbstractControl o FieldState)
      const ctrl = this.control();

      // Si ya había una suscripción previa, la cancelamos para evitar duplicados/fugas
      if (this._controlSubscription) {
        this._controlSubscription.unsubscribe();
        this._controlSubscription = null;
      }

      // Si no hay control o no tiene statusChanges (no es AbstractControl), salimos
      if (!ctrl || (ctrl as AbstractControl).statusChanges === undefined) {
        return;
      }
      // Cast seguro a AbstractControl porque comprobamos statusChanges
      const abstractControl = ctrl as AbstractControl;
      // Creamos una Subscription para agrupar las suscripciones internas
      const sub = new Subscription();
      // Si existe statusChanges, nos suscribimos y actualizamos _validationSig cuando emite
      if (abstractControl.statusChanges) {
        sub.add(
          abstractControl.statusChanges.subscribe(() => this._validationSig.update((n) => n + 1)),
        );
      }
      // Si existe valueChanges, también nos suscribimos para re-evaluar en cambios de valor
      if (abstractControl.valueChanges) {
        sub.add(
          abstractControl.valueChanges.subscribe(() => this._validationSig.update((n) => n + 1)),
        );
      }
      // Guardamos la suscripción agrupada para poder cancelarla más tarde
      this._controlSubscription = sub;
    });
  }

  // Computed que devuelve el mensaje de error (o null si no hay)
  errorMessage = computed<string | null>(() => {
    // Leemos la señal para que esta computed se re-evalúe cuando el control emita
    this._validationSig();
    // Obtenemos el control actual
    const ctrl = this.control();
    if (!ctrl) return null; // si no hay control, no hay mensaje
    // --- Caso FieldState (signals form) ---
    // Detectamos FieldState por la presencia del método invalid()
    if (typeof (ctrl as FieldStateType).invalid === 'function') {
      const fs = ctrl as FieldStateType;
      // Llamamos a invalid() (API de FieldState) para saber si está inválido
      const invalid = (fs as unknown as { invalid: () => boolean }).invalid();
      if (!invalid) return null; // si no está inválido, no mostramos nada
      // Obtenemos errors() (API de FieldState) y comprobamos que sea un array
      const errorsRaw = (fs as unknown as { errors?: () => unknown[] }).errors?.();
      if (!Array.isArray(errorsRaw) || errorsRaw.length === 0) return null;
      // Tomamos el primer error y, si tiene message, lo devolvemos
      const first = errorsRaw[0] as { message?: string } | unknown;
      if (first && typeof (first as { message?: unknown }).message === 'string') {
        return (first as { message: string }).message;
      }
      // Fallback genérico si no hay message
      return 'Campo no válido.';
    }
    // --- Caso AbstractControl (Reactive Forms) ---
    const abstractControl = ctrl as AbstractControl;
    // Si el AbstractControl está inválido, leemos ac.errors
    if (abstractControl.invalid) {
      const errors: ValidationErrors | null = abstractControl.errors ?? null;
      if (!errors) return null;
      // Tomamos la primera clave de error y buscamos un mapper en errorMap
      const firstKey = Object.keys(errors)[0];
      const mapper = this.errorMap[firstKey];
      // Si hay mapper, lo usamos con el payload del error; si no, fallback genérico
      return mapper ? mapper(errors[firstKey]) : 'Campo no válido.';
    }
    // Si no hay error en ninguno de los dos casos, devolvemos null
    return null;
  });

  // Limpiamos la suscripción al destruir el componente para evitar fugas de memoria
  ngOnDestroy(): void {
    this._controlSubscription?.unsubscribe();
    this._controlSubscription = null;
  }
}
