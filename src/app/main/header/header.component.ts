import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileViewComponent } from '../users/user-profile-view/user-profile-view.component';
import { UserProfileSubViewComponent } from '../users/user-profile-sub-view/user-profile-sub-view.component';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SearchService } from 'src/app/services/search.service';
import { UserProfile } from 'src/app/models/user-profile';
import { DrawerService } from 'src/app/services/drawer.service';
import { ThreadService } from 'src/app/services/thread.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  usersAndChannels: any = [];
  searchOutput: boolean = false;
  public currentUser: UserProfile = new UserProfile();

  constructor(private authService: AuthenticationService,
    private afAuth: AngularFireAuth,
    private router: Router,
    public dialog: MatDialog,
    public userFbService: UsersFirebaseService,
    private searchService: SearchService,
    public drawerService: DrawerService,
    public threadService: ThreadService,

  ) { }

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;


  isMenuOpen = false;

  closeMenu() {
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
    this.isMenuOpen = false; // Make sure this line is executed regardless of the condition.
  }

  ngOnInit(): void {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
    this.getCurrentUser();
  }

  async getCurrentUser() {
    const user = await this.userFbService.getUser(this.userFbService.getFromLocalStorage())
    this.currentUser = new UserProfile(user);
  }


  userLoggedout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  openUserProfile() {
    this.dialog.open(UserProfileViewComponent, {
      width: '500px',
      height: '623px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
      autoFocus: false,
    });
  }


  // async searchData() {
  //   const searchResult = await this.searchService.searchUsersAndChannels(this.search)
  //   this.filteredUser = searchResult.filteredUser;
  //   this.filteredChannel = searchResult.filteredChannel;
  // }


  // deleteSearch() {
  //   this.search = '';
  //   this.filteredUser = [];
  //   this.filteredChannel = [];
  //   this.toggleSearchOutput();
  // }


  // toggleSearchOutput() {
  //   this.searchOutput = !this.searchOutput;
  // }


  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('input') && !target.closest('.searchOutputHeader')) {
  //     this.searchOutput = false;
  //   }
  // }


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
