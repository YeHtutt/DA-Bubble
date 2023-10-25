import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-messages',
  template: `
    <h2>{{title}}</h2>
    <p>{{message}}</p>
  `
})


export class CustomSnackbarComponent {
  title: string;
  message: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title;
    this.message = data.message;
  }
}


