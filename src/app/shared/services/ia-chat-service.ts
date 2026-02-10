/* eslint-disable @typescript-eslint/no-explicit-any */
/* import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class IaChatService {
    showIAchat = signal<boolean>(false);

    openIAChat() {
        this.showIAchat.set(true);
    }

    closeIAChat() {
        this.showIAchat.set(false);
    }

    private readonly _API_KEY = environment.geminiApiKey;

    private _genAI = new GoogleGenerativeAI(this._API_KEY);

    // Responde preguntas específicas sobre un producto seleccionado

    async responderSobreProducto(pregunta: string, productoContexto: any) {
        // Normalizamos el contexto del producto
        const info = productoContexto.raw ? productoContexto.raw : productoContexto;

        try {
            // Usamos v1beta y gemini-1.5-flash para máxima compatibilidad
            const model = this._genAI.getGenerativeModel(
                { model: 'gemini-1.5-flash' },
                { apiVersion: 'v1beta' },
            );

            const prompt = `Actúa como vendedor experto. 
                Producto: ${info.title}. 
                Datos técnicos: ${JSON.stringify(info)}. 
                Pregunta del cliente: "${pregunta}". 
                Instrucción: Responde de forma muy breve y amable basada solo en estos datos.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error('Error en Gemini SDK (responderSobreProducto):', error);
            // DETECCIÓN DE CUOTA EXCEDIDA (Error 429)
            if (error.message?.includes('429') || error.status === 429) {
                return '¡Hola! He recibido muchas consultas en el último minuto la couta esta. Por favor, espera un momento y vuelve a consultarme sobre este producto.';
            }

            // Si la IA falla por otra razón, usamos la lógica de respuesta manual
            return this._respuestaDeEmergencia(pregunta, info);
        }
    }

    // Analiza el texto de búsqueda para extraer categoría y precio

    async analizarBusqueda(text: string) {
        try {
            const model = this._genAI.getGenerativeModel(
                { model: 'gemini-1.5-flash' },
                { apiVersion: 'v1beta' },
            );

            const prompt = `Analiza la intención de búsqueda del usuario: "${text}". 
                Debes responder ÚNICAMENTE un objeto JSON válido con este formato:
                {"busqueda": string, "categoria": string, "precioMax": number | null}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Limpieza de Markdown: Gemini a veces envuelve el JSON en ```json ... ```
            const cleanJson = responseText.replace(/```json|```/g, '').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('Error en analizarBusqueda:', error);
            // Retorno seguro para no romper el flujo de la aplicación
            return { busqueda: text, categoria: 'all', precioMax: null };
        }
    }

    // Lógica de respaldo manual basada en palabras clave en caso de fallo de la IA

    private _respuestaDeEmergencia(pregunta: string, info: any): string {
        const q = pregunta.toLowerCase();

        if (q.includes('stock') || q.includes('cuanto hay')) {
            return `Actualmente tenemos ${info.stock} unidades disponibles de ${info.title}.`;
        }

        if (q.includes('caracteristica') || q.includes('detalle') || q.includes('descripcion')) {
            return `Sobre el ${info.title}: ${info.description} (Categoría: ${info.category}).`;
        }

        if (q.includes('precio') || q.includes('cuanto vale') || q.includes('costo')) {
            return `El precio de ${info.title} es de $${info.price}.`;
        }

        // Respuesta genérica de respaldo si no detecta palabras clave
        return `Lo siento, tuve un problema de conexión, pero puedo confirmarte que el producto ${info.title} cuesta $${info.price} y tenemos ${info.stock} en stock.`;
    }
} */

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
   * Responde preguntas sobre un producto usando la nueva sintaxis
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
                text: `Actúa como vendedor experto. 
                  Producto: ${info.title}. 
                  Datos técnicos: ${JSON.stringify(info)}. 
                  Pregunta del cliente: "${pregunta}". 
                  Instrucción: Responde de forma muy breve y amable basada solo en estos datos.`,
              },
            ],
          },
        ],
      });

      return response.text;
    } catch (error: any) {
      console.error('Error en Gemini (responderSobreProducto):', error);

      // Manejo de cuota (Error 429)
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
      // Limpieza de Markdown por si la IA devuelve bloques de código
      const cleanJson = responseText.replace(/```json|```/g, '').trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Error en analizarBusqueda:', error);
      return { busqueda: text, categoria: 'all', precioMax: null };
    }
  }

  /**
   * Lógica de respaldo manual
   */
  private _respuestaDeEmergencia(pregunta: string, info: any): string {
    const q = pregunta.toLowerCase();
    if (q.includes('stock')) return `Tenemos ${info.stock} unidades de ${info.title}.`;
    if (q.includes('precio')) return `El precio de ${info.title} es $${info.price}.`;

    return `Lo siento, hubo un error de conexión. El producto ${info.title} cuesta $${info.price}.`;
  }
}
