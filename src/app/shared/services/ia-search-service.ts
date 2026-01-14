/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IaSearchService {
    // API KEY de Google AI Studio
    private readonly API_KEY = 'AIzaSyDODa09flpkNEWQ82udF7AxiVjZ6tMLLx0';

    // Instanciamos el cliente principal
    private genAI = new GoogleGenerativeAI(this.API_KEY);

    /**
     * Responde preguntas específicas sobre un producto seleccionado
     */
    async responderSobreProducto(pregunta: string, productoContexto: any) {
        // Normalizamos el contexto del producto
        const info = productoContexto.raw ? productoContexto.raw : productoContexto;

        try {
            // Usamos v1beta y gemini-1.5-flash para máxima compatibilidad
            const model = this.genAI.getGenerativeModel(
               { model:"gemini-3-flash-preview" },
                { apiVersion: 'v1beta' }
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
            // Si la IA falla, usamos la lógica de respuesta manual
            return this.respuestaDeEmergencia(pregunta, info);
        }
    }

    /**
     * Analiza el texto de búsqueda para extraer categoría y precio
     */
    async analizarBusqueda(text: string) {
        try {
            const model = this.genAI.getGenerativeModel(
                { model:"gemini-3-flash-preview" },
                { apiVersion: 'v1beta' }
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

    /**
     * Lógica de respaldo manual basada en palabras clave
     */
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

/* 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IaSearchService {
    // Tu API Key confirmada
    private readonly API_KEY = 'AIzaSyDpfgZw0SK2RV-RoEZZhav7nbA_4Vso8xc';
    private genAI = new GoogleGenerativeAI(this.API_KEY);

    async responderSobreProducto(pregunta: string, productoContexto: any) {
        const info = productoContexto.raw ? productoContexto.raw : productoContexto;

        try {
            // CAMBIO CLAVE: Usamos "models/gemini-1.5-flash" (con el prefijo)
            // y volvemos a intentar con v1beta que es la más flexible para keys de AI Studio
            const model = this.genAI.getGenerativeModel(
                { model: 'gemini-1.5-flash' },
                { apiVersion: 'v1beta' },
            );

            const prompt = `Responde breve sobre ${info.title}. Datos: ${JSON.stringify(info)}. Pregunta: ${pregunta}`;

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            // SI EL PLAN A FALLA (Sigue el 404), ejecutamos el Plan B automáticamente
            return this.planB_RespuestaManual(pregunta, info);
        }
    }

    // PLAN B: El "Cerebro Manual" (Para que el usuario nunca vea el error)
    private planB_RespuestaManual(pregunta: string, info: any): string {
        const q = pregunta.toLowerCase();
        if (q.includes('stock') || q.includes('cuanto')) {
            return `Contamos con ${info.stock} unidades de ${info.title}.`;
        }
        if (q.includes('caracteristica') || q.includes('detalle') || q.includes('descrip')) {
            return `${info.title}: ${info.description}. Es de la categoría ${info.category}.`;
        }
        return `El producto ${info.title} tiene un precio de $${info.price}. ¿Te gustaría saber algo más?`;
    }

    async analizarBusqueda(text: string) {
        try {
            const model = this.genAI.getGenerativeModel(
                { model: 'gemini-1.5-flash' },
                { apiVersion: 'v1' },
            );
            const prompt = `Analiza: "${text}". Responde SOLO un JSON: {"busqueda": string, "categoria": string, "precioMax": number | null}`;
            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch {
            return { busqueda: text, categoria: 'all', precioMax: null };
        }
    }
} */

/* 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IaSearchService {
    private genAI = new GoogleGenerativeAI('AIzaSyDpfgZw0SK2RV-RoEZZhav7nbA_4Vso8xc');
    // Usamos el modelo más básico para evitar conflictos de versiones
    private model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    async responderSobreProducto(pregunta: string, productoContexto: any) {
        const info = productoContexto.raw ? productoContexto.raw : productoContexto;
        const query = pregunta.toLowerCase();

        // --- LÓGICA LOCAL (INSTANTÁNEA Y SIN ERRORES) ---
        if (query.includes('stock') || query.includes('cuanto hay')) {
            return `Contamos con ${info.stock} unidades disponibles de ${info.title}.`;
        }
        if (query.includes('precio') || query.includes('cuánto cuesta') || query.includes('vale')) {
            return `El precio actual de ${info.title} es de $${info.price}.`;
        }
        if (query.includes('garantia') || query.includes('garantía')) {
            return `La garantía de este producto es: ${info.warrantyInformation || 'No especificada'}.`;
        }
        if (query.includes('caracteristica') || query.includes('detalle')) {
            return `Detalles de ${info.title}: ${info.description}`;
        }

        // --- SI NO ES UNA PREGUNTA TÉCNICA, INTENTAMOS IA ---
        try {
            const prompt = `
                Eres un asistente de ventas. Datos: ${JSON.stringify(info)}
                Pregunta: "${pregunta}"
                Responde de forma muy breve.
            `;
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error de IA, usando respuesta genérica:", error);
            return `Lo siento, tengo problemas de conexión, pero puedo decirte que ${info.title} es una excelente opción en la categoría de ${info.category}. ¿Te gustaría saber el precio o stock?`;
        }
    }

    // Asegúrate de tener un try/catch similar en analizarBusqueda si también falla
    async analizarBusqueda(text: string) {
        try {
            // ... tu lógica de prompt aquí
            // Si falla, devuelve un objeto por defecto para que el chat no muera
            return { busqueda: text, categoria: 'all', precioMax: null };
        } catch {
            return { busqueda: text, categoria: 'all', precioMax: null };
        }
    }
} */
