import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { PrimaryButton } from '../primary-button/primary-button';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';
import { IaChatService } from '../../services/ia-chat-service';
import { AuthStore } from '../../../pages/auth/state/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PrimaryButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  title = signal<string>('Angular Ecommerce-v20');
  isMenuOpen = signal(false);

  cartService = inject(CartService);
  readonly authStore = inject(AuthStore);

  private _router = inject(Router);
  private _chatIAService = inject(IaChatService);
  private _elementRef = inject(ElementRef); // Para acceder al DOM del componente

  redirectToCart() {
    if (this.cartService.cart().length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    this._router.navigate(['/cart']);
  }

  login() {
    this._router.navigate(['/login']);
  }

  logout() {
    this.authStore.logout();
  }

  openAIAssistant() {
    this._chatIAService.showIAchat.set(true);
  }

  redirectToHomePage() {
    this._router.navigate(['/']);
  }

  redirectToAdminPanel() {
    this._router.navigate(['/admin']);
  }

  toggleMenu() {
    this.isMenuOpen.update((prev) => !prev);
  }

  // Para cerrar menu login al hacer clic por fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Si el menú está cerrado, no hacemos nada
    if (!this.isMenuOpen()) return;

    // Verificamos si el clic fue fuera del elemento del componente
    const clickedInside = this._elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isMenuOpen.set(false);
    }
  }
}
