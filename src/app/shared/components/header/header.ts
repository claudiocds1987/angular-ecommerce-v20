import { Component, inject, signal } from '@angular/core';
import { PrimaryButton } from '../primary-button/primary-button';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';
import { IaChatService } from '../../services/ia-chat-service';


@Component({
    selector: 'app-header',
    imports: [PrimaryButton],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    title = signal<string>('Angular Ecommerce-v20');

    cartService = inject(CartService); 

    private _router = inject(Router);
    private _chatIAService = inject(IaChatService);

    redirectToCart() {
        if(this.cartService.cart().length === 0) {
            alert('El carrito está vacío.');
            return;
        }
        this._router.navigate(['/cart']);
    }

    openAIAssistant() {
       this._chatIAService.showIAchat.set(true);
    }


    redirectToHomePage() {
        this._router.navigate(['/']);
    }


}
