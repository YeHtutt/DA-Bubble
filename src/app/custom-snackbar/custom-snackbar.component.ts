import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <mat-dialog-content>
      {{ message }}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onAccept()">Accept</button>
    </mat-dialog-actions>
  `
})

export class CustomSnackbarComponent {

  message: string = '';

  constructor(
    public dialogRef: MatDialogRef<CustomSnackbarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.message = data.message;
  }


  onAccept(): void {
    this.dialogRef.close(true);
  }


  onCancel(): void {
    this.dialogRef.close(false);
  }
}