import { Injectable } from '@angular/core';
import { ErrorHandlingComponent } from '../error-handling/error-handling.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private dialog: MatDialog) {
  }

  showError(title: string, message: string): void {
    this.dialog.open(ErrorHandlingComponent, {
      width: '250px',
      data: { title, message }
    });
  }
}