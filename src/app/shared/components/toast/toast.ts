import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { ToastConfig, ToastService } from '../../services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  config: WritableSignal<ToastConfig | null>;
  showAnimation = signal(false);

  typeStyles = {
    success: 'bg-emerald-600/90 border-emerald-400 text-white',
    danger: 'bg-rose-600/90 border-rose-400 text-white',
    warning: 'bg-amber-500/90 border-amber-300 text-black',
  };

  private _toastService = inject(ToastService);

  constructor() {
    this.config = this._toastService.config;

    effect(() => {
      if (this.config()) {
        setTimeout(() => this.showAnimation.set(true), 10);
      } else {
        this.showAnimation.set(false);
      }
    });
  }

  close() {
    this.showAnimation.set(false);
    // Esperamos a que termine la animación de salida antes de destruir el componente
    setTimeout(() => this._toastService.config.set(null), 300);
  }
}
