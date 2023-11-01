import { HostListener, Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  drawer?: MatDrawer;
  drawerSub: Subscription = new Subscription()
  isDrawerOpen: boolean = false;

  constructor() { }

  ngOnInit() {

  }

  initDrawerListener() {
    if (this.drawer) {
      this.drawerSub = this.drawer.openedChange.subscribe((isOpen: boolean) => {
        this.isDrawerOpen = isOpen;
        console.log(this.isDrawerOpen)
      });
    }
  }

  setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
    this.initDrawerListener();
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
