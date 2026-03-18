import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { ExcelService } from '../../services/excel-service';
import { ImportResultResponse } from '../../models/import-result-response.model';
import { SpinnerService } from '../../services/spinner-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './excel-upload.html',
  styleUrl: './excel-upload.scss',
})
export class ExcelUpload {
  endpointUrl = input.required<string>();
  @Output() uploadSuccess = new EventEmitter<ImportResultResponse>();
  @Output() uploadError = new EventEmitter<HttpErrorResponse | string[]>();
  loading = signal<boolean>(false);

  private _excelService = inject(ExcelService);
  private _spinnerService = inject(SpinnerService);

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (!inputElement.files?.length) return;

    const file: File = inputElement.files[0];

    this.loading.set(true);

    this._spinnerService.show();

    this._excelService.uploadExcel(this.endpointUrl(), file).subscribe({
      next: (response: ImportResultResponse) => {
        this.loading.set(false);
        this.uploadSuccess.emit(response);
        inputElement.value = '';
        this._spinnerService.hide();
      },
      error: (err: HttpErrorResponse) => {
        // Usamos el tipo real para mayor seguridad
        this.loading.set(false);

        // Buscamos la lista de errores en PascalCase (lo que manda tu .NET) o camelCase
        const apiResponse = err.error;
        const errorList = apiResponse?.Errors ||
          apiResponse?.errors || [err.message || 'Error desconocido al procesar el archivo'];

        // Emitimos la lista real (las 79 filas fallidas que vimos en Network)
        this.uploadError.emit(errorList);

        inputElement.value = '';
        this._spinnerService.hide();
        console.error('Error capturado en el hijo:', err);
      },
    });
  }
}
