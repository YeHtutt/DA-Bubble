import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'da-bubble';
  hide = false;

  hideText() {
    this.hide = true;
  }
}
