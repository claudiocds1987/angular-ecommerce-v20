import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

// Interfaz para asegurar que el componente tenga el método canDeactivate
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // Si el componente tiene el método, lo ejecuta, si no, permite salir (true)
  return component.canDeactivate ? component.canDeactivate() : true;
};
