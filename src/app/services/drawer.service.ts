import { Injectable } from '@angular/core';
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
    this.drawer?.open();
  }

  close() {
    this.drawer?.close();
  }

  toggle() {
    this.drawer?.toggle();
  }
}
