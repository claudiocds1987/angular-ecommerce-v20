/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class IaChatService {
    showIAchat = signal<boolean>(false);

    /* toggleChat() {
    this.showChat.update(state => !state);
  } */

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
                { model: 'gemini-3-flash-preview' },
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
            return this.respuestaDeEmergencia(pregunta, info);
            // Si la IA falla, usamos la lógica de respuesta manual
            return this.respuestaDeEmergencia(pregunta, info);
        }
    }

    // Analiza el texto de búsqueda para extraer categoría y precio

    async analizarBusqueda(text: string) {
        try {
            const model = this._genAI.getGenerativeModel(
                { model: 'gemini-3-flash-preview' },
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

    private respuestaDeEmergencia(pregunta: string, info: any): string {
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
}
