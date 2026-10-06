import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SpinnerService } from '@shared/services/spinner-service';

@Component({
  selector: 'app-spinner',
  imports: [],
  templateUrl: './spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './spinner.scss',
})
export class Spinner {
  public spinnerService = inject(SpinnerService);
}
