import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@features/auth/state/auth.store';

// Importaciones requeridas de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormFieldError } from '../../../shared/components/form-field-error/form-field-error';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';
import { Breadcrumb, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
@Component({
  selector: 'app-login-component',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormFieldError,
    PrimaryButton,
    Breadcrumb,
  ],
  standalone: true,
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  breadcrumbItems = signal<BreadcrumbItem[]>([{ label: 'Inicio', url: '/' }, { label: 'Login' }]);

  private _fb = inject(FormBuilder);
  authStore = inject(AuthStore);

  loginForm: FormGroup;
  hidePassword = signal(true);

  constructor() {
    this.loginForm = this._fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // SOLUCIÓN AL RE-INTENTO: Si el usuario vuelve a escribir, borramos el error del backend automáticamente
    this.loginForm.valueChanges.subscribe(() => {
      if (this.authStore.error()) {
        this.authStore.clearError();
      }
    });
  }

  isReadyToLogin(): boolean {
    return this.loginForm.valid && this.loginForm.dirty;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { username, password } = this.loginForm.value;
    this.authStore.login({ username: username, password: password });
  }
}
