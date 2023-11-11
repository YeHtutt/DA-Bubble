import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { DrawerService } from 'src/app/services/drawer.service';
import { ThreadService } from 'src/app/services/thread.service';




@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  user: any;
  @ViewChild(MatDrawer) drawer?: MatDrawer;
  isDrawerOpen: boolean = false;
  drawerSub: Subscription = new Subscription;
  isMobile: boolean = false;
  windowWidth: any;

  constructor(

    public dialog: MatDialog,
    public authService: AuthenticationService,
    public afAuth: AngularFireAuth,
    private drawerService: DrawerService,
    private threadService: ThreadService

  ) {}

  ngOnInit() {
    this.checkScreenSize();
  }

  ngAfterViewInit() {
    if (this.drawer) {
      this.drawerSub = this.drawer.openedChange.subscribe((isOpen: boolean) => {
        this.isDrawerOpen = isOpen;
      });
      this.drawerService.setDrawer(this.drawer);
    }
  }

  ngOnDestroy() {
    this.drawerSub.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
    if(!this.isMobile && window.innerWidth > 750) this.drawer?.open();
    if(window.innerWidth < 1440 && this.threadService.threadIsOpen) this.drawer?.close();
    this.windowWidth = window.innerWidth;
  }

  checkScreenSize() {
    if(window.innerWidth < 750) this.isMobile = true;
    if(window.innerWidth > 750) this.isMobile = false;
  }

  openProfileDialog(node: any) {
    const userId = node.id;
    const userName = node.name;
    const userPhotoURL = node.photoURL;
    const userEmail = node.email;
    const isOnline = node.isOnline;

    this.dialog.open(UserProfileSubViewComponent, {
      width: '500px',
      height: '727px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
      data: {
        id: userId,
        name: userName,
        photoURL: userPhotoURL,
        email: userEmail,
        isOnline: isOnline
      }
    });
  }
}
