import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@features/auth/state/auth.store';

// Importaciones de Material y componentes compartidos
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Button } from '@shared/components/button/button';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-login-component',
  imports: [
    FormsModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Button,
    Breadcrumb,
  ],
  standalone: true,
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  breadcrumbItems = signal<BreadcrumbItem[]>([{ label: 'Inicio', url: '/' }, { label: 'Login' }]);

  authStore = inject(AuthStore);
  hidePassword = signal(true);

  // 1. Model Signal con el estado inicial de los campos
  loginModel = signal({
    username: '',
    password: '',
  });

  // 2. Formulario enlazado al schema
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, { message: 'El usuario es requerido' });
    required(schemaPath.password, { message: 'La contraseña es requerida' });
  });

  constructor() {
    this._clearAuthError();
    effect(() => {
      this.loginModel();
    });
  }

  // Al escribir en los input borra el mensaje de error de login que devuelve el backend si es que existe
  onFieldChange() {
    this._clearAuthError();
  }

  private _clearAuthError() {
    if (this.authStore.error()) {
      this.authStore.clearError();
    }
  }

  isReadyToLogin(): boolean {
    return this._isFormValid() && this._isFormDirty();
  }

  onSubmit() {
    if (!this._isFormValid()) {
      this.loginForm.username().markAsTouched();
      this.loginForm.password().markAsTouched();
      return;
    }

    const { username, password } = this.loginModel();
    this.authStore.login({ username, password });
  }

  private _isFormValid(): boolean {
    return (
      this.loginForm.username().invalid() === false && this.loginForm.password().invalid() === false
    );
  }

  private _isFormDirty(): boolean {
    return this.loginForm.username().dirty() || this.loginForm.password().dirty();
  }
}
