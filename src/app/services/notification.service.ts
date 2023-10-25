import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../custom-snackbar/custom-snackbar.component';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {



  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }


  checkInputLength(inputField: any): void {
    if (inputField.hasError('required')) {
      this.showError('Channel name is required!');
    } else if (inputField.hasError('minlength')) {
      this.showError('Input should have at least 3 letters!');
    }
  }

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

  showConfirmation(message: string, acceptCallback: () => void): void {
    const dialogRef = this.dialog.open(CustomSnackbarComponent, {
      width: '300px',
      data: { message: message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // if the result is true, meaning the "Accept" button was clicked
        acceptCallback();
      }
    });
  }

}



