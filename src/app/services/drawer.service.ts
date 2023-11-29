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
  isMobile: boolean = false;


  constructor() { }

  ngOnInit() {
    this.checkMobileMode(window.innerWidth);
    this.checkScreenSizeForResponsive(window.innerWidth)
      }


  ngOnDestroy() {
    this.drawerSub.unsubscribe();
  }


  initDrawerListener() {
    if (this.drawer) {
      this.drawerSub = this.drawer.openedChange.subscribe((isOpen: boolean) => {
        this.isDrawerOpen = isOpen;
      });
    }
  }


  setDrawer(drawer: MatDrawer) {
    this.drawer = drawer;
    this.initDrawerListener();
  }


  open() {
    if (this.checkScreenSize()) this.drawer?.open();
  }


  close() {
    if (this.checkScreenSize()) this.drawer?.close();
  }


  closeWithoutCondition() {
    this.drawer?.close();
  }


  toggle() {
    this.drawer?.toggle();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    this.checkMobileMode(event.target.innerWidth);
  }


  checkScreenSize() {
    if (window.innerWidth < 750) {
      return true;
    } else {
      return false;
    }
  }


  checkScreenSizeForResponsive(width: number) {
    if (window.innerWidth < width) {
      return true;
    } else {
      return false;
    }
  }


  checkMobileMode(width: number): void {
    this.isMobile = width <= 750;    
  }
}
