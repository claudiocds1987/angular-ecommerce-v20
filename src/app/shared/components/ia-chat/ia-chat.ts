/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, ViewChild, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { IaChatService } from '../../services/ia-chat-service';
import { GeminiResponse } from '../../models/gemini-response.model';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  products?: Product[];
}

@Component({
  selector: 'app-ia-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia-chat.html',
  styleUrl: './ia-chat.scss',
})
export class IaChat {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  iaChatService = inject(IaChatService);

  messages = signal<Message[]>([
    { text: '¡Hola! Soy tu asistente inteligente. ¿En qué puedo ayudarte hoy?', sender: 'bot' },
  ]);

  userInput = signal<string>('');
  isTyping = signal<boolean>(false);

  selectedProduct = signal<any | null>(null);

  constructor() {
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isTyping()) return;

    this.messages.update((prev) => [...prev, { text, sender: 'user' }]);
    this.userInput.set('');
    this.isTyping.set(true);

    try {
      if (this.selectedProduct()) {
        // --- MODO: Vendedor Experto cuando selecciono un producto desde el asistente IA ---
        const respuesta = await this.iaChatService.askAboutProduct(text, this.selectedProduct().id);

        this.messages.update((prev) => [...prev, { text: respuesta, sender: 'bot' }]);
      } else {
        // --- MODO: Búsqueda General ---
        const iaResponse: GeminiResponse = await this.iaChatService.sendPromptToAI(text);

        this.messages.update((prev) => [
          ...prev,
          {
            text: iaResponse.Response,
            sender: 'bot',
            products: iaResponse.Products.map((p: any) => {
              const product = {
                id: p.id,
                title: p.title,
                price: p.price,
                finalPrice: this._applyDiscount(p),
                discountPercentage: p.discountPercentage,
                image: p.thumbnail,
                stock: p.stock,
                category: p.category,
                rating: p.rating,
              };
              return product;
            }),
          },
        ]);
      }
    } catch (error) {
      console.error('Error en el chat:', error);
      this.messages.update((prev) => [
        ...prev,
        { text: 'Lo siento, hubo un error. Inténtalo de nuevo.', sender: 'bot' },
      ]);
    } finally {
      this.isTyping.set(false);
    }
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.messages.update((prev) => [
      ...prev,
      {
        text: `Has seleccionado: ${product.title}. ¿Qué te gustaría saber sobre este producto?`,
        sender: 'bot',
      },
    ]);
  }

  clearSelection() {
    this.selectedProduct.set(null);
    this.messages.update((prev) => [
      ...prev,
      {
        text: 'Selección anulada. ¿Qué otro producto buscas ahora?',
        sender: 'bot',
      },
    ]);
  }

  closeIAChat() {
    this.iaChatService.closeIAChat();
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  private _applyDiscount(product: Product): number {
    if (product.discountPercentage && product.discountPercentage > 0) {
      const discount = (product.price * product.discountPercentage) / 100;
      const price = product.price - discount;
      return Number(price.toFixed(2));
    }
    return product.price;
  }
}
