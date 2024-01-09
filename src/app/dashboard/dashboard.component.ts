import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserProfile } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DrawerService } from 'src/app/shared/services/drawer.service';
import { ThreadService } from 'src/app/shared/services/thread.service';
import { UsersFirebaseService } from 'src/app/shared/services/users-firebase.service';
import { PresenceService } from '../shared/services/presence.service';
import { UserProfileSubViewComponent } from './users/user-profile-sub-view/user-profile-sub-view.component';
import { UserProfileViewComponent } from './users/user-profile-view/user-profile-view.component';
import { MainIdsService } from '../shared/services/main-ids.service';


/**
 * Component for the main dashboard view of the application.
 * This component handles user interactions, manages state related to the dashboard, 
 * and integrates with various services for user data, authentication, and presence updates.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

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


  constructor(
    private router: Router,
    public userFbService: UsersFirebaseService,
    public dialog: MatDialog,
    public drawerService: DrawerService,
    public threadService: ThreadService,
    private authService: AuthenticationService,
    private presence: PresenceService,
    private idsService: MainIdsService
  ) { }


  /**
   * Handles the window beforeunload event to update user status.
   * @param event  - The beforeunload event object.
   */
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event) {
    setTimeout(() => this.updateUserStatus(false), 5000);
  }


  async ngOnInit() {
    this.router.navigate([`/dashboard/channel/${this.idsService.mainChannelId}`]);
    this.getCurrentUser();
    this.userId = this.userFbService.getFromLocalStorage();
    this.getUserDataAndSubscribe();
  }


  ngOnDestroy() {
    this.updateUserStatus(false);
    this.statusUpdateSubscription?.unsubscribe();
    this.unsubscribeUserFn();
    this.userSubjectUnSub.unsubscribe();
  }


  getUserDataAndSubscribe() {
    const observable = this.userFbService.getCurrentUserSubject();
    this.unsubscribeUserFn = observable.unsubscribe;
    this.userSubjectUnSub = observable.observable.subscribe((user: any) => { this.loggedinUser = user });
  }


  private checkMobileMode(width: number): void {
    this.isMobile = width <= 750;
  }


  /**
  * Updates the online status of the current user.
  * @param {boolean} status - The new online status to set.
  */
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


  /**
  * Opens a user profile dialog where the data of the user are displayed.
  * @param {any} node - The node data containing user information.
  */
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

}
