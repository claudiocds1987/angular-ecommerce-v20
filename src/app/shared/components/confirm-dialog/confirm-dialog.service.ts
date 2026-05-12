import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogData } from './confirm-dialog.types';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly _dialog = inject(MatDialog);

  /**
   * Abre un diálogo de confirmación parametrizable. Emite `true` si el usuario confirma.
   */
  open(data: ConfirmDialogData, config?: MatDialogConfig<ConfirmDialogData>): Observable<boolean> {
    const ref = this._dialog.open(ConfirmDialog, {
      width: 'min(420px, 92vw)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      data,
      ...config,
    });
    return ref.afterClosed().pipe(map((r) => r === true));
  }
}
