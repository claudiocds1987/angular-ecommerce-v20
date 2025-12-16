import { Component, signal } from '@angular/core';
import { PrimaryButton } from '../primary-button/primary-button';

@Component({
  selector: 'app-header',
  imports: [PrimaryButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  title = signal<string>('Angular Ecommerce-v20');

  redirectToCart() {
    console.log('Redirigiendo al carrito de compras...');
  }
}
