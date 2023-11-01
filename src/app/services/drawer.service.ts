import { HostListener, Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  drawer?: MatDrawer;

  constructor() { }

  ngOnInit() {

  }

  setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
  }

  open() {
    if(this.checkScreenSize()) this.drawer?.open();
  }

  close() {
    if(this.checkScreenSize()) this.drawer?.close();
  }

  toggle() {
    this.drawer?.toggle();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if(window.innerWidth < 750) {
      return true;
    } else {
      return false;
    }
  }
}
