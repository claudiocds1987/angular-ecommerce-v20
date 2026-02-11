import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IaChatService {
  // Signals para controlar la UI del chat
  showIAchat = signal<boolean>(false);

  // Inicialización diferida del cliente para evitar errores si no hay Key (entorno local)
  private _ai: any;
  private get ai() {
    if (!this._ai) {
      if (!environment.geminiApiKey) {
        console.warn(
          'IA Chat: No se detectó GEMINI_API_KEY. El chat funcionará en modo emergencia.',
        );
        return null;
      }
      this._ai = new GoogleGenAI({
        apiKey: environment.geminiApiKey,
        apiVersion: 'v1',
      });
    }
    return this._ai;
  }

  openIAChat() {
    this.showIAchat.set(true);
  }

  closeIAChat() {
    this.showIAchat.set(false);
  }

  /**
   * Responde preguntas sobre un producto
   */
  async responderSobreProducto(pregunta: string, productoContexto: any) {
    const info = productoContexto.raw ? productoContexto.raw : productoContexto;

    try {
      if (!this.ai) return this._respuestaDeEmergencia(pregunta, info);

      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Actúa como vendedor experto de una tienda e-commerce. 
                  Producto: ${info.title}. 
                  Datos técnicos: ${JSON.stringify(info)}. 
                  Pregunta del cliente: "${pregunta}". 
                  Instrucción: Responde de forma muy breve (máximo 2 frases), amable y basada solo en estos datos.`,
              },
            ],
          },
        ],
      });

      return response.text;
    } catch (error: any) {
      console.error('Error en Gemini (responderSobreProducto):', error);

      if (error.status === 429 || error.message?.includes('429')) {
        return '¡Hola! He recibido muchas consultas. Por favor, espera un momento y vuelve a preguntarme.';
      }

      return this._respuestaDeEmergencia(pregunta, info);
    }
  }

  /**
   * Analiza la búsqueda para extraer JSON estructurado
   */
  async analizarBusqueda(text: string) {
    try {
      if (!this.ai) return { busqueda: text, categoria: 'all', precioMax: null };

      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analiza la intención de búsqueda del usuario: "${text}". 
                  Debes responder ÚNICAMENTE un objeto JSON válido con este formato:
                  {"busqueda": string, "categoria": string, "precioMax": number | null}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text ?? '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Error en analizarBusqueda:', error);
      return { busqueda: text, categoria: 'all', precioMax: null };
    }
  }

  private _respuestaDeEmergencia(pregunta: string, info: any): string {
    const q = pregunta.toLowerCase();
    if (q.includes('stock')) return `Tenemos ${info.stock} unidades de ${info.title} disponibles.`;
    if (q.includes('precio')) return `El precio de ${info.title} es $${info.price}.`;

    return `Lo siento, tuve un inconveniente al procesar tu pregunta. El producto ${info.title} cuesta $${info.price}. ¿Te gustaría saber algo más?`;
  }
}
