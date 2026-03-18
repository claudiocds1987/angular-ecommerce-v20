import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { ExcelService } from '../../services/excel-service';
import { ImportResultResponse } from '../../models/import-result-response.model';

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
  @Output() uploadError = new EventEmitter<string[]>();
  loading = signal<boolean>(false);

  private _excelService = inject(ExcelService);

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (!inputElement.files?.length) return;

    const file: File = inputElement.files[0];

    this.loading.set(true);

    this._excelService.uploadExcel(this.endpointUrl(), file).subscribe({
      next: (response: ImportResultResponse) => {
        this.loading.set(false);
        this.uploadSuccess.emit(response);
        inputElement.value = '';
      },
      error: (err: { error?: { errors?: string[] } }) => {
        this.loading.set(false);
        const errorList = err.error?.errors ?? ['Error desconocido al procesar el archivo'];
        this.uploadError.emit(errorList);
        inputElement.value = '';
      },
    });
  }
}
