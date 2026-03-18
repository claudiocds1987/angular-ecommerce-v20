import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImportResultResponse } from '../models/import-result-response.model';

@Injectable({
  providedIn: 'root',
})

/**
 * Sube un archivo Excel/CSV al endpoint especificado.
 * @param url URL del endpoint (ej: api/import/products)
 * @param file El archivo binario capturado
 * @returns Observable con la estructura ImportResultResponse
 */
export class ExcelService {
  private _http = inject(HttpClient);

  uploadExcel(url: string, file: File): Observable<ImportResultResponse> {
    const formData = new FormData();
    // "file" debe coincidir con el nombre del parámetro IFormFile del archivo ImportController del backend
    formData.append('file', file, file.name);

    return this._http.post<ImportResultResponse>(url, formData);
  }

  downloadErrorReport(errors: string[], fileNamePrefix = 'errores_importacion'): void {
    if (!errors || errors.length === 0) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const blobContent =
      `REPORTE DE ERRORES\n=================\nFecha: ${new Date().toLocaleString()}\n\n` +
      errors.join('\n');

    const blob = new Blob([blobContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileNamePrefix}_${timestamp}.txt`;

    document.body.appendChild(a);
    a.click();

    // Limpieza
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
