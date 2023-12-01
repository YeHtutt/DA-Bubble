import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserProfile } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { ThreadService } from 'src/app/services/thread.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfileSubViewComponent } from './users/user-profile-sub-view/user-profile-sub-view.component';
import { UserProfileViewComponent } from './users/user-profile-view/user-profile-view.component';
import { PresenceService } from '../services/presence.service';
import { MatDrawer } from '@angular/material/sidenav';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('drawerAnimation', [
      state('open', style({
        width: '25%',
        display: 'block',
        opacity: '1',
        padding: '25px'
      })),
      state('closed', style({
        width: '0%',
        display: 'none',
        opacity: '0',
        padding: '0px'
      })),
      transition('open => closed', animate('0.3s ease-in-out', keyframes([
        style({ width: '0%', padding: '0px', opacity: '0', offset: 0.99 }), // Animate width to 0%
        style({ display: 'none', offset: 1 }) // Then set display to none
      ]))),
      transition('closed => open', animate('0.3s ease-in-out'))
    ])
  ]
})

export class MainComponent implements OnInit {
  user: any;
  @ViewChild(MatDrawer) drawer?: MatDrawer;

  windowWidth: any;
  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  usersAndChannels: any = [];
  searchOutput: boolean = false;
  isMobile = false;
  public currentUser: UserProfile = new UserProfile();
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  isMenuOpen = false;
  userId: string | null = '';
  private statusUpdateSubscription?: Subscription;
  private readonly heartbeatInterval = 60000;
  loggedinUser: any;
  userSubjectUnSub: Subscription = new Subscription();
  private unsubscribeUserFn!: () => void;
  isDrawerOpen: boolean = false;
  drawerSub: Subscription = new Subscription;

  constructor(
    private router: Router,
    public userFbService: UsersFirebaseService,
    public dialog: MatDialog,
    public drawerService: DrawerService,
    public threadService: ThreadService,
    private authService: AuthenticationService,
    private presence: PresenceService,
  ) { }


  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event) {
    setTimeout(() => this.updateUserStatus(false), 5000);
  }


  applyTransition = false;

  onDrawerOpened() {
    this.applyTransition = true;
  }

  onDrawerClosed() {
    this.applyTransition = false;
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }


  async ngOnInit() {
    this.router.navigate(['/main/channel/MLYdOZo8nhH04EOnjoUg']);
    this.getCurrentUser();
    this.userId = this.userFbService.getFromLocalStorage();
    this.getUserDataAndSubscribe();
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
    this.updateUserStatus(false);
    this.statusUpdateSubscription?.unsubscribe();
    this.unsubscribeUserFn();
    this.userSubjectUnSub.unsubscribe();
    this.drawerSub.unsubscribe();
  }

  getUserDataAndSubscribe() {
    const observable = this.userFbService.getCurrentUserSubject();
    this.unsubscribeUserFn = observable.unsubscribe;
    this.userSubjectUnSub = observable.observable.subscribe((user: any) => { this.loggedinUser = user });
  }


  private checkMobileMode(width: number): void {
    this.isMobile = width <= 750;
  }

  updateUserStatus(status: boolean) {
    this.userFbService.updateUserOnlineStatus(this.userId, status)
  }

  closeMenu() {
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
    this.isMenuOpen = false; // Make sure this line is executed regardless of the condition.
  }


  async getCurrentUser() {
    const user = await this.userFbService.getUser(this.userFbService.getFromLocalStorage())
    this.currentUser = new UserProfile(user);
  }


  userLoggedout() {
    this.authService.logout();
    this.presence.signOut();
    this.router.navigate(['/login']);
  }


  openUserProfile() {
    this.dialog.open(UserProfileViewComponent, {
      width: '500px',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'user-profile-view-dialog',
      autoFocus: false,
    });
  }


  openProfileDialogInSearch(node: any) {
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
