import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, input, Output, signal } from '@angular/core';
import { ExcelService } from '@features/admin-tools/services/excel-service';
import { ImportResultResponse } from '@features/admin-tools/models/import-result-response.model';
import { SpinnerService } from '@shared/services/spinner-service';
import { HttpErrorResponse } from '@angular/common/http';
import { PrimaryButton } from '@shared/components/primary-button/primary-button';

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [CommonModule, PrimaryButton],
  templateUrl: './excel-upload.html',
  styleUrl: './excel-upload.scss',
})
export class ExcelUpload {
  endpointUrl = input.required<string>();
  @Input() text = 'Importar Excel'; // Texto del botón, con valor por defecto
  @Output() uploadSuccess = new EventEmitter<ImportResultResponse>();
  @Output() uploadError = new EventEmitter<string[]>(); // Emitiremos el array de mensajes directamente

  @Output() importError = new EventEmitter<HttpErrorResponse>();
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
        this.loading.set(false);
        this._spinnerService.hide();

        const apiResponse = err.error;
        // Extraemos las filas con error (Fila 2: ya existe...)
        const errorList: string[] = apiResponse?.Errors || apiResponse?.errors || [err.message];

        this.uploadError.emit(errorList);
        inputElement.value = '';
      },
    });
  }
}
