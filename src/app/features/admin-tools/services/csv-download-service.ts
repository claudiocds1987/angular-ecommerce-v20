/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsvDownloadService {
  /**
   * Descarga un archivo CSV a partir de un array de objetos.
   * @param data Lista de objetos con los datos (ejemplo o reales).
   * @param filename Nombre del archivo (sin extensión).
   */
  downloadCsv(data: any[], filename = 'plantilla-importacion'): void {
    if (!data || !data.length) {
      return;
    }

    // ";" para separar las columnas
    const separator = ';';

    // 1. Extraer las cabeceras (keys del objeto)
    const headers = Object.keys(data[0]).join(separator);

    // 2. Formatear las filas
    const rows = data.map((obj) => {
      return Object.values(obj)
        .map((value) => this._formatValue(value))
        .join(separator);
    });

    // 3. Unir cabeceras y filas con saltos de línea
    const csvContent = [headers, ...rows].join('\n');

    // 4. UTF-8 BOM para compatibilidad total con Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 5. Crear link de descarga y dispararlo
    this._download(blob, `${filename}.csv`);
  }

  private _formatValue(value: any): string {
    const result = value === null || value === undefined ? '' : String(value);

    // Protege el contenido para que no se "desparrame" en varias celdas de Excel.
    // Ejemplo: 'url1.jpg, url2.jpg' -> "url1.jpg, url2.jpg"
    // Sin las comillas, la coma crearía una columna extra y rompería el archivo.

    if (
      result.includes(';') ||
      result.includes(',') ||
      result.includes('"') ||
      result.includes('\n')
    ) {
      // Envolvemos en comillas y escapamos las comillas internas
      return `"${result.replace(/"/g, '""')}"`;
    }

    return result;
  }

  private _download(blob: Blob, fullFilename: string): void {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Liberar memoria
    }
  }
}
