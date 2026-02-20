import { inject, Injectable, signal } from '@angular/core';

import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { GeminiResponse } from '../models/gemini-response.model';

@Injectable({
  providedIn: 'root',
})
export class IaChatService {
  showIAchat = signal<boolean>(false);

  private http = inject(HttpClient);

  private apiUrl = `${environment.serverUrl}/api/Gemini/ask`;

  openIAChat() {
    this.showIAchat.set(true);
  }
  closeIAChat() {
    this.showIAchat.set(false);
  }

  // LLama a mi Backend de .NET que ya tiene el catálogo y la seguridad
  async consultarAlBackend(pregunta: string): Promise<{ Response: string; Products: Product[] }> {
    const body = { prompt: pregunta };
    return firstValueFrom(this.http.post<GeminiResponse>(this.apiUrl, body));
  }

  async responderSobreProducto(pregunta: string, productId: number): Promise<string> {
    const expertUrl = `${environment.serverUrl}/api/Gemini/seller-expert`;
    const body = {
      productId: productId,
      userMessage: pregunta,
    };

    // Usamos el DTO de respuesta que espera un objeto con { response: "..." }
    const res = await firstValueFrom(this.http.post<{ response: string }>(expertUrl, body));

    return res.response;
  }
}
