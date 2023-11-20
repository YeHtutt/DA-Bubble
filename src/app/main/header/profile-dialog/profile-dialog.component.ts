import { Component } from '@angular/core';
import { UserProfileViewComponent } from '../../users/user-profile-view/user-profile-view.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent {

  constructor(
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private router: Router,
  ) { }

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


}
