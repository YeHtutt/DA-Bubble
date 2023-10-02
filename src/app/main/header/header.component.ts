import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileViewComponent } from '../user-profile-view/user-profile-view.component';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';
import { Auth } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private authService: AuthenticationService, 
    private afAuth: AngularFireAuth,
    private router: Router, 
    public dialog: MatDialog, 
    public userFbService: UsersFirebaseService, 
    private auth: Auth) {

  }

  
  ngOnInit(): void {
    this.userFbService.getLoggedInUser(this.userFbService.getFromLocalStorage());
    //console.log('currentUserID:__', this.userFbService.getFromLocalStorage())
  }

  userLoggedout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openUserProfile() {
    this.dialog.open(UserProfileViewComponent, {
      width: '500px',
      height: '705px',
      hasBackdrop: true,
      panelClass: 'dialog-main-style',
    });
  }

}
