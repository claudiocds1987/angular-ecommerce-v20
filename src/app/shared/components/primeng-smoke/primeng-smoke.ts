import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';

/**
 * Smoke test de PrimeNG (DatePicker + Button) con tema Lara / clases nativas.
 * Usado para verificar instalación; se puede eliminar cuando ya no haga falta.
 */
@Component({
  selector: 'app-primeng-smoke',
  standalone: true,
  imports: [FormsModule, DatePicker, Button],
  template: `
    <section class="primeng-smoke" aria-label="PrimeNG smoke test">
      <p-button label="PrimeNG OK" icon="pi pi-check" />
      <p-datepicker [(ngModel)]="selectedDate" placeholder="Seleccionar fecha" [showIcon]="true" />
    </section>
  `,
  styles: `
    .primeng-smoke {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
    }
  `,
})
export class PrimengSmoke {
  selectedDate: Date | null = null;
}
