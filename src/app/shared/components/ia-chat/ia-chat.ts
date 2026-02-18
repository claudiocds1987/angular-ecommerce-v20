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

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isTyping()) return;

    this.messages.update((prev) => [...prev, { text, sender: 'user' }]);
    this.userInput.set('');
    this.isTyping.set(true);

    // 1. Consultamos a nuestro Backend Pro de .NET
    const respuestaIA = await this.iaChatService.consultarAlBackend(text);
    console.log(respuestaIA);

    this.messages.update((prev) => [
      ...prev,
      {
        text: respuestaIA.Response,
        sender: 'bot',
        products: respuestaIA.Products.map((p: any) => ({
          id: p.Id, // Asegúrate de que Id coincida (mayúscula/minúscula)
          title: p.Title,
          price: p.Price,
          image: p.Thumbnail,
          stock: p.Stock,
          category: p.Category,
          rating: p.Rating,
        })),
      },
    ]);
    /* const respuestaIA = await this.iaChatService.consultarAlBackend(text);

    // 2. Agregamos la respuesta al chat
    this.messages.update((prev) => [
      ...prev,
      {
        text: respuestaIA,
        sender: 'bot',
      },
    ]); */

    this.isTyping.set(false);
  }

  /*  selectProduct(product: any) {
    this.selectedProduct.set(product);
    this.messages.update((prev) => [
      ...prev,
      {
        text: `Has seleccionado: ${product.title}. ¿Qué te gustaría saber sobre sus características, stock o garantía?`,
        sender: 'bot',
      },
    ]);
  } */

  /*   clearSelection() {
    this.selectedProduct.set(null);
    this.messages.update((prev) => [
      ...prev,
      {
        text: 'Selección anulada. ¿Qué otro producto buscas ahora?',
        sender: 'bot',
      },
    ]);
  } */

  /* async sendMessage() {
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
  } */

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
