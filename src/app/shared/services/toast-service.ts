import { Injectable, signal } from '@angular/core';

export interface ToastConfig {
  message: string;
  type: ToastType;
}

export type ToastType = 'success' | 'danger' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  config = signal<ToastConfig | null>(null);

  show(message: string, type: ToastType = 'success') {
    this.config.set({ message, type });

    setTimeout(() => {
      this.config.set(null);
    }, 3000);
  }
}
