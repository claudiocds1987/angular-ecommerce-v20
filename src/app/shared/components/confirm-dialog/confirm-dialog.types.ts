export type ConfirmDialogConfirmColor = 'primary' | 'accent' | 'warn';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ConfirmDialogConfirmColor;
}
