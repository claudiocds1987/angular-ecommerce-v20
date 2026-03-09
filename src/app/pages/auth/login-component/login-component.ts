import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../state/auth.store';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly authStore = inject(AuthStore);
  username = '';
  password = '';

  onSubmit(e: Event) {
    e.preventDefault();
    this.authStore.login({ username: this.username, password: this.password });
  }
}
