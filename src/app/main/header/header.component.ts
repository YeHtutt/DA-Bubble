import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UserProfileViewComponent } from '../user-profile-view/user-profile-view.component';
import { UsersFirebaseService } from 'src/app/services/users-firebase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  constructor(private authService: AuthenticationService, private router: Router, public dialog: MatDialog, public userFbService: UsersFirebaseService) {

  }

  ngOnInit(): void {}

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
