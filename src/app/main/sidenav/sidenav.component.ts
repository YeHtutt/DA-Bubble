import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  showSidenav: boolean = true;
  @Input() channel_window: any;

  constructor() {
    // this.channel_window = 'main-channel';
  }


  toggleSidenav() {
    if (this.showSidenav) {
      this.showSidenav = false;
      console.log('true');
    } else {
      this.showSidenav = true;
      console.log('false');
    }
  }
}
