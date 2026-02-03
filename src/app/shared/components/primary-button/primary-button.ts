import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.scss',
})
export class PrimaryButton {
  label = input<string | number>('');
  disabled = input<boolean>(false);
  iconUrl = input<string | null>(null);
  btnClicked = output<void>();

  onClick() {
    this.btnClicked.emit();
  }
}
