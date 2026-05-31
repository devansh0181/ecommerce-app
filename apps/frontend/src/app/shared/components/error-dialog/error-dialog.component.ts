import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ErrorDialogData {
  title?: string;
  message: string;
  error?: any;
  retryFn?: () => void;
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
})
export class ErrorDialogComponent {
  title: string;
  message: string;
  showDetails = false;
  errorDetails: string;

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {
    this.title = data.title || 'Error';
    this.message = data.message || 'An error occurred';
    this.errorDetails = data.error?.message || JSON.stringify(data.error, null, 2);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onRetry(): void {
    if (this.data.retryFn) {
      this.data.retryFn();
    }
    this.dialogRef.close(true);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
