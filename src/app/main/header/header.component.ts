import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileViewComponent } from '../user-profile-view/user-profile-view.component';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Auth } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SearchService } from 'src/app/services/search.service';
import { UserProfile } from 'src/app/models/user-profile';
import { Channel } from 'src/app/models/channel';

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

  constructor(private authService: AuthenticationService, 
    private afAuth: AngularFireAuth,
    private router: Router, 
    public dialog: MatDialog, 
    public userFbService: UsersFirebaseService, 
    private auth: Auth,
    private searchService: SearchService
    ) {}

  
  ngOnInit(): void {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
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
    });
  }

  async searchData() {
    const searchResult = await this.searchService.searchUsersAndChannels(this.search)
    this.filteredUser = searchResult.filteredUser;
    this.filteredChannel = searchResult.filteredChannel;
  }

  toggleSearchOutput() {
    this.searchOutput = !this.searchOutput;
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   const target = event.target as HTMLElement;
  //   if (!target.closest('input') && !target.closest('.searchOutputHeader')) {
  //     this.searchOutput = false;
  //   }
  // }

  openProfil(user: UserProfile) {

  }

  openChannel(channel: Channel) {
    
  }

}
