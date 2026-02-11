/* eslint-disable @typescript-eslint/no-explicit-any */
/* import { Component, ElementRef, ViewChild, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { IaChatService } from '../../services/ia-chat-service';

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
    private http = inject(HttpClient);

    messages = signal<Message[]>([
        { text: '¡Hola! Soy tu asistente inteligente. ¿En qué puedo ayudarte hoy?', sender: 'bot' },
    ]);
    userInput = signal<string>('');
    isTyping = signal<boolean>(false);

    // NUEVO: Signal para almacenar el producto sobre el que el usuario quiere preguntar
    selectedProduct = signal<any | null>(null);

    constructor() {
        effect(() => {
            this.messages();
            setTimeout(() => this.scrollToBottom(), 100);
        });
    }

    // NUEVO: Método para activar el modo "Preguntar sobre este producto"
    selectProduct(product: any) {
        this.selectedProduct.set(product);
        this.messages.update((prev) => [
            ...prev,
            {
                text: `Has seleccionado: ${product.title}. ¿Qué te gustaría saber sobre sus características, stock o garantía?`,
                sender: 'bot',
            },
        ]);
    }

    // NUEVO: Método para limpiar la selección si el usuario quiere volver a buscar normal
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

    async sendMessage() {
        const text = this.userInput().trim();
        if (!text || this.isTyping()) return;

        this.messages.update((prev) => [...prev, { text, sender: 'user' }]);
        this.userInput.set('');
        this.isTyping.set(true);

        try {
            // LÓGICA CONDICIONAL: ¿Estamos preguntando por un producto o buscando uno nuevo?
            if (this.selectedProduct()) {
                // Modo: Pregunta específica sobre un producto (RAG simple)
                const respuesta = await this.iaChatService.responderSobreProducto(
                    text,
                    this.selectedProduct(),
                );

                this.messages.update((prev) => [
                    ...prev,
                    {
                        text: respuesta,
                        sender: 'bot',
                    },
                ]);
                this.isTyping.set(false);
            } else {
                // Modo: Búsqueda general en catálogo
                const filtros = await this.iaChatService.analizarBusqueda(text);
                const url = `https://dummyjson.com/products/search?q=${filtros.busqueda}`;

                this.http.get<any>(url).subscribe({
                    next: (res) => {
                        const rawProducts = res.products || [];

                        const mappedProducts: Product[] = rawProducts.map((p: any) => ({
                            id: p.id,
                            title: p.title,
                            price: p.price,
                            rating: {
                                rate: p.rating,
                                count: p.stock,
                            },
                            image: p.thumbnail,
                            category: p.category,
                            // Guardamos el objeto original para tener los datos extra (warranty, etc)
                            raw: p,
                        }));

                        let filtered = mappedProducts;
                        // Solo filtramos si filtros.precioMax no es null ni undefined
                        if (filtros.precioMax !== null && filtros.precioMax !== undefined) {
                            filtered = filtered.filter((p) => p.price <= filtros.precioMax!);
                        }

                        if (filtered.length === 0) {
                            this.messages.update((prev) => [
                                ...prev,
                                {
                                    text: `No encontré productos específicos para "${text}", pero puedes ver nuestro catálogo general.`,
                                    sender: 'bot',
                                },
                            ]);
                        } else {
                            this.messages.update((prev) => [
                                ...prev,
                                {
                                    text: `¡Encontré estas opciones de ${filtros.busqueda} para ti! Haz clic en uno para preguntarme detalles.`,
                                    sender: 'bot',
                                    products: filtered.slice(0, 3),
                                },
                            ]);
                        }
                        this.isTyping.set(false);
                    },
                    error: (err) => {
                        console.error('Error HTTP:', err);
                        this.isTyping.set(false);
                    },
                });
            }
        } catch (e) {
            console.error('Error General:', e);
            this.isTyping.set(false);
        }
    }

    private scrollToBottom() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop =
                this.scrollContainer.nativeElement.scrollHeight;
        }
    }
}
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, ViewChild, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { IaChatService } from '../../services/ia-chat-service';

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
  private http = inject(HttpClient);

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

  selectProduct(product: any) {
    this.selectedProduct.set(product);
    this.messages.update((prev) => [
      ...prev,
      {
        text: `Has seleccionado: ${product.title}. ¿Qué te gustaría saber sobre sus características, stock o garantía?`,
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

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isTyping()) return;

    // Añadir mensaje del usuario
    this.messages.update((prev) => [...prev, { text, sender: 'user' }]);
    this.userInput.set('');
    this.isTyping.set(true);

    try {
      if (this.selectedProduct()) {
        // MODO: Pregunta sobre producto seleccionado
        const respuesta = await this.iaChatService.responderSobreProducto(
          text,
          this.selectedProduct(),
        );

        this.messages.update((prev) => [
          ...prev,
          {
            // CORRECCIÓN: Si respuesta es undefined, usamos un texto por defecto
            text: respuesta ?? 'Lo siento, no pude procesar esa respuesta. Inténtalo de nuevo.',
            sender: 'bot',
          },
        ]);
        this.isTyping.set(false);
      } else {
        // MODO: Búsqueda general
        const filtros = await this.iaChatService.analizarBusqueda(text);

        // CORRECCIÓN: Asegurar que busqueda no sea undefined para la URL
        const busquedaTerm = filtros?.busqueda ?? text;
        const url = `https://dummyjson.com/products/search?q=${busquedaTerm}`;

        this.http.get<any>(url).subscribe({
          next: (res) => {
            const rawProducts = res.products || [];

            const mappedProducts: Product[] = rawProducts.map((p: any) => ({
              id: p.id,
              title: p.title,
              price: p.price,
              rating: {
                rate: p.rating,
                count: p.stock,
              },
              image: p.thumbnail,
              category: p.category,
              raw: p,
            }));

            let filtered = mappedProducts;
            if (filtros?.precioMax !== null && filtros?.precioMax !== undefined) {
              filtered = filtered.filter((p) => p.price <= filtros.precioMax!);
            }

            if (filtered.length === 0) {
              this.messages.update((prev) => [
                ...prev,
                {
                  text: `No encontré productos específicos para "${text}", pero puedes ver nuestro catálogo general.`,
                  sender: 'bot',
                },
              ]);
            } else {
              this.messages.update((prev) => [
                ...prev,
                {
                  text: `¡Encontré estas opciones de ${busquedaTerm} para ti! Haz clic en uno para preguntarme detalles.`,
                  sender: 'bot',
                  products: filtered.slice(0, 3),
                },
              ]);
            }
            this.isTyping.set(false);
          },
          error: (err) => {
            console.error('Error HTTP:', err);
            this.isTyping.set(false);
          },
        });
      }
    } catch (e) {
      console.error('Error General:', e);
      this.isTyping.set(false);
    }
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
}
