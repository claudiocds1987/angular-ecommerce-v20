/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Input, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CommonModule } from '@angular/common';

/**
 * Interfaz Genérica: Permite que el componente sea usado para Productos,
 * Usuarios o cualquier entidad que maneje una URL de imagen.
 */
export interface IImageResource {
  imageUrl: string;
  id?: number | string | null;
  [key: string]: any; // Permite propiedades extra como productId, userId, etc.
}

@Component({
  selector: 'app-upload-image',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadImageComponent),
      multi: true,
    },
  ],
  templateUrl: './upload-image.html',
  styleUrl: './upload-image.scss',
})
export class UploadImageComponent implements ControlValueAccessor {
  @Input() title = '';
  @Input() maxFileSizeMB = 2; // límite de tamaño en MB para la validación
  @Input() maxFiles = 5; // límite maximo de imagenes a cargar

  // Estado local usando Signals con tipado fuerte
  images = signal<IImageResource[]>([]);
  urlInput = '';
  isDragging = false;

  errorMessage = signal<string | null>(null);

  private _imageCompress = inject(NgxImageCompressService);

  // Funciones de ControlValueAccessor tipadas
  onChange: (value: IImageResource[] | string) => void = () => {};
  onTouched: () => void = () => {};

  /**
   * Actualiza el valor desde el formulario padre (ej. al cargar el producto a editar)
   */
  writeValue(value: IImageResource[] | string): void {
    if (value) {
      // Si el valor es un string (una sola URL)
      if (typeof value === 'string') {
        this.images.set([{ imageUrl: value, id: null }]);
      }
      // Si ya es un array, lo seteamos normal
      else if (Array.from(value)) {
        this.images.set(value);
      }
    } else {
      this.images.set([]);
    }
  }

  registerOnChange(fn: (value: IImageResource[] | string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.errorMessage.set(null); // Limpiar errores previos
      const files = Array.from(input.files);

      for (const file of files) {
        // Validamos si hay espacio antes de procesar cada archivo
        if (this.images().length >= this.maxFiles) {
          this.errorMessage.set(`Límite máximo de ${this.maxFiles} imágenes alcanzado.`);
          break;
        }
        await this.processFile(file);
      }
      input.value = ''; // Reset del input para permitir subir la misma foto si se borra
    }
  }

  async processFile(file: File) {
    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      alert(`La imagen ${file.name} supera los ${this.maxFileSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const content = e.target?.result as string;
      if (content) {
        const result = await this._imageCompress.compressFile(content, -1, 50, 80);
        this.addImageToList(result);
      }
    };
    reader.readAsDataURL(file);
  }

  addImageFromUrl() {
    this.errorMessage.set(null);
    if (this.images().length >= this.maxFiles) {
      this.errorMessage.set(`No puedes añadir más de ${this.maxFiles} imágenes.`);
      return;
    }

    const trimmedUrl = this.urlInput.trim();
    if (trimmedUrl) {
      this.addImageToList(trimmedUrl);
      this.urlInput = '';
    }
  }

  private addImageToList(url: string) {
    if (this.images().length < this.maxFiles) {
      const newImage: IImageResource = { imageUrl: url, id: null };
      this.images.set([...this.images(), newImage]);
      this.notifyChanges();
    }
  }

  removeImage(index: number) {
    const updated = this.images().filter((_, i) => i !== index);
    this.images.set(updated);
    this.errorMessage.set(null);
    this.notifyChanges();
  }

  notifyChanges() {
    const currentImages = this.images();
    if (this.maxFiles === 1) {
      // Si es para thumbnail, enviamos solo la URL (string) al formulario padre
      const valueToSend = currentImages.length > 0 ? currentImages[0].imageUrl : '';
      this.onChange(valueToSend);
    } else {
      // Si son varias, enviamos el array completo
      this.onChange(currentImages);
    }
    this.onTouched();
  }

  // --- Manejo de Drag and Drop ---

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const files = e.dataTransfer?.files;
    if (files) {
      this.errorMessage.set(null);
      for (const file of Array.from(files)) {
        if (this.images().length >= this.maxFiles) {
          this.errorMessage.set(`Límite alcanzado.`);
          break;
        }
        this.processFile(file);
      }
    }
  }
}
