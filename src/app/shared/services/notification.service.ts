import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


/**
* A service for displaying notifications, like error or success messages.
*/
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar,
     ) { }


  /* Notification */

  showError(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }


  showSuccess(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }


  showInfo(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}



