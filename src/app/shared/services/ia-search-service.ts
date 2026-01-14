import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IaSearchService {
    // Forzamos el uso de la versión estable 'v1'
    private genAI = new GoogleGenerativeAI('AIzaSyDpfgZw0SK2RV-RoEZZhav7nbA_4Vso8xc');

    async responderSobreProducto(pregunta: string, productoContexto: any) {
        const info = productoContexto.raw ? productoContexto.raw : productoContexto;

        try {
            // SOLUCIÓN AL 404: Especificar el modelo y llamar a la versión estable
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash" 
            }, { apiVersion: 'v1' }); // <--- ESTO fuerzo la API estable

            const prompt = `
                Eres un asistente de ventas. Datos: ${JSON.stringify(info)}
                Pregunta: "${pregunta}"
                Responde de forma muy breve.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error: any) {
            console.error("Error en Gemini:", error);
            // Si falla la IA, usamos los datos que ya tenemos (tu lógica de respaldo)
            return `Lo siento, hay un problema con el motor de IA, pero según mis datos de ${info.title}, tenemos ${info.stock} unidades a $${info.price}.`;
        }
    }

      async analizarBusqueda(text: string) {
        try {
            // ... tu lógica de prompt aquí
            // Si falla, devuelve un objeto por defecto para que el chat no muera
            return { busqueda: text, categoria: 'all', precioMax: null };
        } catch {
            return { busqueda: text, categoria: 'all', precioMax: null };
        }
    }
}

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