import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private snackBar: MatSnackBar,) { }


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



}
