import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { SearchService } from 'src/app/services/search.service';
import { ThreadService } from 'src/app/services/thread.service';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { UserProfileSubViewComponent } from './users/user-profile-sub-view/user-profile-sub-view.component';
import { UserProfileViewComponent } from './users/user-profile-view/user-profile-view.component';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {


  ngOnInit(): void {
    this.router.navigate(['/main/channel/sB7XI0Od6n5qf2TGgeb4']);
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
    this.getCurrentUser();
  }

  constructor(
    private Route: ActivatedRoute,
    private router: Router,
    public userFbService: UsersFirebaseService,
    private auth: Auth,
    private afAuth: AngularFireAuth,
    public dialog: MatDialog,
    private searchService: SearchService,
    public drawerService: DrawerService,
    public threadService: ThreadService,
    private authService: AuthenticationService,) { }


  public search: string = '';
  filteredUser: any = [];
  filteredChannel: any = [];
  usersAndChannels: any = [];
  searchOutput: boolean = false;
  public currentUser: UserProfile = new UserProfile();



  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;


  isMenuOpen = false;

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
