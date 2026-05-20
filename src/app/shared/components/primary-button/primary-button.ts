import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.scss',
})
export class PrimaryButton {
  type = input<'button' | 'submit'>('button'); // ¡Importante para que procese el formulario reactivo!
  disabled = input<boolean>(false);
  variant = input<ButtonVariant>('primary'); // por default
  // Mantenemos tus propiedades y agregamos la de Angular Material opcional
  iconUrl = input<string | null>(null);
  icon = input<string | undefined>(undefined);
}
