import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  type = input<'button' | 'submit'>('button'); // ¡Importante para que procese el formulario reactivo!
  disabled = input<boolean>(false);
  variant = input<ButtonVariant>('primary'); // por default
  label = input<string>('');
  tooltip = input<string | undefined>(undefined);
  iconUrl = input<string | null>(null);
  icon = input<string | undefined>(undefined);
  iconColor = input<string | undefined>(undefined);

  readonly isIconOnly = computed(() => !this.label());
}
